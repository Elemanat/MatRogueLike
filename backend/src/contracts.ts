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
    startedAt: string;
    seed: string;
    hp: number;
    maxHp: number;
    initialProblem?: ApiProblemDto;
}

export interface RunAnswerRequest {
    runId: string;
    problemId: string;
    answer: string;
    timeSpentMs?: number;
    correctAnswers?: string[];
}

export type RunAnswerState = 'CONTINUE' | 'ENEMY_DEFEATED' | 'FLOOR_COMPLETE' | 'GAME_OVER' | 'VICTORY';

export interface RunAnswerResponse {
    isCorrect: boolean;
    state: RunAnswerState;
    currentHp: number;
    currentScore: number;
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