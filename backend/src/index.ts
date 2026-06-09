import express from 'express';
import cors from 'cors';
import {PrismaClient} from '@prisma/client';
import dotenv from 'dotenv';
import {generateProblem, isEquivalentAnswer} from './problemGenerator';
import type {RunStartRequest, RunAnswerRequest, RunAnswerState} from './contracts';

dotenv.config();

const app = express();

// Debug info
console.log(`[Backend] Node environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`[Backend] Database URL: ${process.env.DATABASE_URL}`);
console.log(`[Backend] Port: ${process.env.PORT || 3001}`);

const prisma = new PrismaClient({
    log: ['error', 'warn'],
});

function generatePlayerCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

app.use(cors());
app.use(express.json());

app.post('/api/runs/start', async (req, res) => {
    try {
        const {playerName, towerId} = req.body as RunStartRequest;
        console.log(`[Backend] POST /api/runs/start`, {playerName, towerId});

        let player = await prisma.player.findUnique({where: {name: playerName}});
        if (!player) {
            player = await prisma.player.create({data: {name: playerName, code: generatePlayerCode()}});
        }

        const seed = `${playerName}-${Date.now()}`;

        const initialProblem = generateProblem({
            towerId,
            floor: 1,
            enemyType: 'NORMAL',
            seed
        });

        const run = await prisma.run.create({
            data: {
                playerId: player.id,
                towerId,
                currentProblemId: initialProblem.id,
                currentProblemAnswers: JSON.stringify(initialProblem.correctAnswers),
                seed,
                hp: 3,
                maxHp: 3
            }
        });

        res.json({
            runId: run.id,
            playerId: player.id,
            playerCode: player.code,
            startedAt: run.startedAt,
            seed: run.seed,
            hp: run.hp,
            maxHp: run.maxHp,
            initialProblem
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Internal server error"});
    }
});

app.post('/api/runs/answer', async (req, res) => {
    try {
        const {
            runId,
            problemId,
            answer,
            timeSpentMs,
            correctAnswers,
            floor,
            room,
            items
        } = req.body as RunAnswerRequest;

        console.log(`\n========================================`);
        console.log(`🔍 [ANSWER CHECK]`);
        console.log(`   runId: ${runId}`);
        console.log(`   problemId: ${problemId}`);
        console.log(`   userAnswer: "${answer}"`);
        console.log(`   correctAnswers from frontend: [${correctAnswers?.join(', ') || 'N/A'}]`);

        const run = await prisma.run.findUnique({where: {id: runId}});
        if (!run) {
            console.log(`   ❌ Run NOT FOUND!`);
            return res.status(404).json({error: "Run not found"});
        }

        let isCorrect = false;
        const topic = run.towerId;

        // ✅ Kontroluj odpověď proti correctAnswers od frontendu
        if (correctAnswers && correctAnswers.length > 0) {
            console.log(`   Using frontend answers`);
            isCorrect = correctAnswers.some(correct => isEquivalentAnswer(answer, correct));
        } else if (run.currentProblemAnswers) {
            // Fallback - pokud frontend neodesílá correctAnswers (zpětná kompatibilita)
            console.log(`   Fallback: Using DB answers`);
            const answers: string[] = JSON.parse(run.currentProblemAnswers);
            isCorrect = answers.some(correct => isEquivalentAnswer(answer, correct));
        }

        console.log(`   ✅ Result: ${isCorrect ? 'CORRECT ✓' : 'WRONG ✗'}`);
        console.log(`========================================\n`);

        await prisma.answerLog.create({
            data: {
                runId: run.id,
                problemId: problemId,
                topic: topic,
                playerAnswer: answer,
                isCorrect: isCorrect,
                timeSpentMs: timeSpentMs ?? null
            }
        });

        let newHp = run.hp;
        let newScore = run.score;
        let state: RunAnswerState = 'CONTINUE';

        if (isCorrect) {
            newScore += 10;
        } else {
            newHp -= 1;
            if (newHp <= 0) {
                state = 'GAME_OVER';
            }
        }

        let nextProblem;
        if (state !== 'GAME_OVER') {
            nextProblem = generateProblem({
                towerId: run.towerId,
                floor: run.floor,
                enemyType: 'NORMAL',
                seed: `${problemId}:next:${Date.now()}`
            });
        }

        await prisma.run.update({
            where: {id: runId},
            data: {
                currentProblemId: nextProblem ? nextProblem.id : null,
                currentProblemAnswers: nextProblem ? JSON.stringify(nextProblem.correctAnswers) : null,
                score: newScore,
                hp: newHp,
                floor: floor ?? run.floor,
                room: room ?? run.room,
                items: items ?? run.items,
                status: state === 'GAME_OVER' ? 'GAME_OVER' : run.status,
                finishedAt: state === 'GAME_OVER' ? new Date() : null
            }
        });

        res.json({
            isCorrect,
            state,
            currentHp: newHp,
            currentScore: newScore,
            nextProblem,
            rewardItemId: isCorrect ? (Math.random() > 0.8 ? "ADD_TIME" : undefined) : undefined
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Internal server error"});
    }
});

app.post('/api/players/login-by-code', async (req, res) => {
    try {
        const {code} = req.body;

        if (!code) {
            return res.status(400).json({error: "Code is required"});
        }

        const player = await prisma.player.findUnique({
            where: {code}
        });

        if (!player) {
            return res.status(404).json({error: "Player not found"});
        }

        res.json({
            playerId: player.id,
            playerCode: player.code,
            playerName: player.name
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Internal server error"});
    }
});

app.get('/api/players/:playerName/stats', async (req, res) => {
    try {
        const {playerName} = req.params;

        const player = await prisma.player.findUnique({
            where: {name: playerName},
            include: {
                runs: {
                    include: {
                        answers: true
                    }
                }
            }
        });

        if (!player) {
            return res.status(404).json({error: "Player not found"});
        }

        const totalRuns = player.runs.length;
        let totalAnswers = 0;
        let correctAnswers = 0;
        const topicStats: Record<string, { total: number, correct: number }> = {};

        player.runs.forEach(run => {
            run.answers.forEach(ans => {
                totalAnswers++;
                if (ans.isCorrect) correctAnswers++;

                if (!topicStats[ans.topic]) {
                    topicStats[ans.topic] = {total: 0, correct: 0};
                }
                topicStats[ans.topic]!.total++;
                if (ans.isCorrect) {
                    topicStats[ans.topic]!.correct++;
                }
            });
        });

        res.json({
            playerName: player.name,
            overall: {
                totalRuns,
                totalAnswers,
                correctAnswers,
                accuracyPercentage: totalAnswers === 0 ? 0 : Math.round((correctAnswers / totalAnswers) * 100)
            },
            byTopic: topicStats
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Internal server error"});
    }
});

app.get('/api/runs/active', async (req, res) => {
    try {
        const playerId = req.query.playerId as string;
        if (!playerId) {
            return res.status(400).json({error: "playerId is required"});
        }

        const run = await prisma.run.findFirst({
            where: {
                playerId,
                status: 'IN_PROGRESS'
            }
        });

        if (!run) {
            return res.status(404).json({error: "No active run found"});
        }

        res.json({
            runId: run.id,
            towerId: run.towerId,
            floor: run.floor,
            room: run.room,
            hp: run.hp,
            maxHp: run.maxHp,
            score: run.score,
            items: run.items,
            currentProblemId: run.currentProblemId,
            currentProblemAnswers: run.currentProblemAnswers,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Internal server error"});
    }
});

const PORT = process.env.PORT || 3001;

app.get('/api/problems/next', (req, res) => {
    try {
        const towerId = req.query.towerId as string;
        const floor = parseInt(req.query.floor as string) || 1;
        const enemyType = (req.query.enemyType as string) || 'NORMAL';

        const problem = generateProblem({
            towerId,
            floor,
            enemyType,
            // Přidáme time-based seed, aby se příklady neopakovaly
            seed: `${towerId}:${floor}:${enemyType}:${Date.now()}`
        });

        res.json({problem});
    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Internal server error"});
    }
});

app.listen(PORT, () => {
    console.log(`\n========================================`);
    console.log(`🚀 BACKEND SPUŠTĚN! 🚀`);
    console.log(`Kuchyně VěžMatu je otevřená!`);
    console.log(`Server naslouchá na: http://localhost:${PORT}`);
    console.log(`========================================\n`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n[Backend] Shutting down...');
    await prisma.$disconnect();
    process.exit(0);
});
