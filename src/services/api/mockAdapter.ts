import type {ApiClient} from './client';
import type {
    NextProblemRequest,
    NextProblemResponse,
    RunAnswerRequest,
    RunAnswerResponse,
    RunStartRequest,
    RunStartResponse,
    PlayerStatsResponse,
} from './contracts';
import {generateProblem, isEquivalentAnswer} from './problemGenerator';

const problemRegistry = new Map<string, ReturnType<typeof generateProblem>>();
const runContextMap = new Map<string, { towerId: string }>();

function remember(problem: ReturnType<typeof generateProblem>): ReturnType<typeof generateProblem> {
    problemRegistry.set(problem.id, problem);
    return problem;
}

function generateAndRemember(request: { towerId: string; floor: number; enemyType: string; seed?: string }) {
    return remember(generateProblem(request));
}

function nextProblemFrom(problemId: string, fallbackTowerId: string): ReturnType<typeof generateProblem> {
    const current = problemRegistry.get(problemId);
    // Použijeme towerId z cache nebo fallback
    const towerId = current?.topic ?? fallbackTowerId;

    if (!current) {
        console.warn(`[MockAdapter] Problem ${problemId} not found in registry, using fallback towerId: ${towerId}`);
    }

    return generateAndRemember({
        towerId,
        floor: current?.difficulty ?? 1,
        enemyType: 'NORMAL',
        seed: `${problemId}:next`,
    });
}

export function createMockApiClient(): ApiClient {
    return {
        runs: {
            async startRun(request: RunStartRequest): Promise<RunStartResponse> {
                const initialProblem = generateAndRemember({
                    towerId: request.towerId,
                    floor: 1,
                    enemyType: 'NORMAL',
                    seed: `${request.playerName}-${Date.now()}`,
                });

                const runId = `mock-${request.towerId}-${Date.now()}`;
                runContextMap.set(runId, {towerId: request.towerId});

                return {
                    runId,
                    startedAt: new Date().toISOString(),
                    initialProblem,
                };
            },
            async answer(request: RunAnswerRequest): Promise<RunAnswerResponse> {
                const problem = problemRegistry.get(request.problemId);
                const isCorrect = Boolean(problem && problem.correctAnswers.some(correct => isEquivalentAnswer(request.answer, correct)));

                const runContext = runContextMap.get(request.runId);
                const fallbackTowerId = runContext?.towerId ?? problem?.topic ?? 'fractions';

                // Odstraněno zdvojené volání remember()
                const nextProblem = nextProblemFrom(request.problemId, fallbackTowerId);

                return {
                    isCorrect,
                    // V mocku natvrdo vracíme CONTINUE (v realitě sem poleze state z backendu)
                    state: 'CONTINUE',
                    nextProblem,
                };
            },
        },
        problems: {
            async getNext(request: NextProblemRequest): Promise<NextProblemResponse> {
                return {
                    problem: generateAndRemember({
                        towerId: request.towerId,
                        floor: request.floor,
                        enemyType: request.enemyType,
                        seed: `${request.towerId}:${request.floor}:${request.enemyType}`,
                    }),
                };
            },
        },
        players: {
            async getStats(playerName: string): Promise<PlayerStatsResponse> {
                return {
                    playerName,
                    overall: {
                        totalRuns: 5,
                        totalAnswers: 50,
                        correctAnswers: 40,
                        accuracyPercentage: 80
                    },
                    byTopic: {
                        'fractions': {total: 30, correct: 25},
                        'decimals': {total: 20, correct: 15}
                    }
                };
            }
        }
    };
}