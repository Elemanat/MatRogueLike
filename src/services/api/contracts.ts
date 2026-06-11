export interface ApiProblemDto {
    id: string;
    prompt: string;
    correctAnswers: string[];
    wrongAnswers: string[];
    topic: string;
    difficulty: number;
}

export interface RunStartRequest {
    playerName: string;
    towerId: string;
}

export interface RunStartResponse {
    runId: string;
    playerId: string;
    playerCode: string;
    startedAt: string;
    seed?: string;     // Přidáno
    hp?: number;       // Přidáno
    maxHp?: number;    // Přidáno
    initialProblem?: ApiProblemDto;
}

export interface LoginByCodeResponse {
    playerId: string;
    playerCode: string;
    playerName: string;
}

export interface RunAnswerRequest {
    runId: string;
    problemId: string;
    answer: string;
    correctAnswers?: string[];
    floor?: number;
    room?: number;
    items?: string;
}

export type RunAnswerState = 'CONTINUE' | 'ENEMY_DEFEATED' | 'FLOOR_COMPLETE' | 'GAME_OVER' | 'VICTORY';

export interface RunAnswerResponse {
    isCorrect: boolean;
    state: RunAnswerState;
    nextProblem?: ApiProblemDto;
    rewardItemId?: string;
}

export interface NextProblemRequest {
    towerId: string;
    floor: number;
    enemyType: string;
}

export interface NextProblemResponse {
    problem: ApiProblemDto;
}

export interface PlayerStatsResponse {
    playerName: string;
    overall: {
        totalRuns: number;
        totalAnswers: number;
        correctAnswers: number;
        accuracyPercentage: number;
    };
    byTopic: Record<string, { total: number; correct: number }>;
    towerBadges: Record<string, number>;
}