import express from 'express';
import cors from 'cors';
import {PrismaClient} from '@prisma/client';
import dotenv from 'dotenv';
import {generateProblem, isEquivalentAnswer} from './problemGenerator';
import type {RunStartRequest, RunAnswerRequest, RunAnswerState} from './contracts';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.post('/api/runs/start', async (req, res) => {
    try {
        const {playerName, towerId} = req.body as RunStartRequest;

        let player = await prisma.player.findUnique({where: {name: playerName}});
        if (!player) {
            player = await prisma.player.create({data: {name: playerName}});
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
        const {runId, problemId, answer, timeSpentMs} = req.body as RunAnswerRequest;

        const run = await prisma.run.findUnique({where: {id: runId}});
        if (!run) {
            return res.status(404).json({error: "Run not found"});
        }

        let isCorrect = false;
        const topic = run.towerId;

        if (run.currentProblemAnswers) {
            const answers: string[] = JSON.parse(run.currentProblemAnswers);
            isCorrect = answers.some(correct => isEquivalentAnswer(answer, correct));
        }

        await prisma.answerLog.create({
            data: {
                runId: run.id,
                problemId: problemId,
                topic: topic,
                playerAnswer: answer,
                isCorrect: isCorrect,
                timeSpentMs: timeSpentMs
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

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
});