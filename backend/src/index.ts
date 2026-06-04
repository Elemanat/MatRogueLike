import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { generateProblem, isEquivalentAnswer } from './problemGenerator';
import type { RunStartRequest, RunAnswerRequest } from './contracts';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// API route from contract: /api/runs/start
app.post('/api/runs/start', async (req, res) => {
  try {
    const { playerName, towerId } = req.body as RunStartRequest;

    // Find or create player
    let player = await prisma.player.findUnique({ where: { name: playerName } });
    if (!player) {
      player = await prisma.player.create({ data: { name: playerName } });
    }

    const initialProblem = generateProblem({
      towerId,
      floor: 1,
      enemyType: 'NORMAL',
      seed: `${playerName}-${Date.now()}`
    });

    // Create a new run
    const run = await prisma.run.create({
      data: {
        playerId: player.id,
        towerId,
        currentProblemId: initialProblem.id,
        currentProblemAnswers: JSON.stringify(initialProblem.correctAnswers)
      }
    });

    res.json({
      runId: run.id,
      startedAt: run.startedAt,
      initialProblem
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// API route from contract: /api/runs/answer
app.post('/api/runs/answer', async (req, res) => {
  try {
    const { runId, problemId, answer } = req.body as RunAnswerRequest;

    const run = await prisma.run.findUnique({ where: { id: runId } });
    if (!run) {
      return res.status(404).json({ error: "Run not found" });
    }

    if (run.currentProblemId !== problemId) {
       // Just generate next securely anyway, but let's handle the isCorrect based on fallback or error
    }

    let isCorrect = false;
    let topic = run.towerId; // Default in case problem differs
    
    if (run.currentProblemAnswers) {
      const answers: string[] = JSON.parse(run.currentProblemAnswers);
      isCorrect = answers.some(correct => isEquivalentAnswer(answer, correct));
    }

    // --- Uložení statistiky odpovědi do AnswerLogu ---
    await prisma.answerLog.create({
      data: {
        runId: run.id,
        problemId: problemId,
        topic: topic,
        playerAnswer: answer,
        isCorrect: isCorrect
      }
    });
    // -----------------------------------------------

    // Generate next problem
    const nextProblem = generateProblem({
      towerId: run.towerId,
      floor: run.floor,
      enemyType: 'NORMAL',
      seed: `${problemId}:next:${Date.now()}`
    });

    // Update run
    await prisma.run.update({
      where: { id: runId },
      data: {
        currentProblemId: nextProblem.id,
        currentProblemAnswers: JSON.stringify(nextProblem.correctAnswers),
        score: isCorrect ? run.score + 10 : run.score,
        // we can increment floor optionally if desired
      }
    });

    res.json({
      isCorrect,
      state: "CONTINUE",
      nextProblem,
      rewardItemId: isCorrect ? (Math.random() > 0.8 ? "ADD_TIME" : null) : null
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Získání osobních statistik hráče (NOVÝ ENDPOINT)
app.get('/api/players/:playerName/stats', async (req, res) => {
  try {
    const { playerName } = req.params;

    const player = await prisma.player.findUnique({
      where: { name: playerName },
      include: {
        runs: {
          include: {
            answers: true
          }
        }
      }
    });

    if (!player) {
      return res.status(404).json({ error: "Player not found" });
    }

    // Výpočet statistik uživatele
    const totalRuns = player.runs.length;
    let totalAnswers = 0;
    let correctAnswers = 0;
    const topicStats: Record<string, { total: number, correct: number }> = {};

    player.runs.forEach(run => {
      run.answers.forEach(ans => {
        totalAnswers++;
        if (ans.isCorrect) correctAnswers++;

        if (!topicStats[ans.topic]) {
          topicStats[ans.topic] = { total: 0, correct: 0 };
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
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Backend is running on http://localhost:${PORT}`);
});
