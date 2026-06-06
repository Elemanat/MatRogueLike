import type {
    NextProblemRequest,
    NextProblemResponse,
    RunAnswerRequest,
    RunAnswerResponse,
    RunStartRequest,
    RunStartResponse,
    PlayerStatsResponse,
} from './contracts';

export interface RunsApi {
    startRun(request: RunStartRequest): Promise<RunStartResponse>;

    answer(request: RunAnswerRequest): Promise<RunAnswerResponse>;
}

export interface ProblemsApi {
    getNext(request: NextProblemRequest): Promise<NextProblemResponse>;
}

export interface PlayersApi {
    getStats(playerName: string): Promise<PlayerStatsResponse>;
}

export interface ApiClient {
    runs: RunsApi;
    problems: ProblemsApi;
    players: PlayersApi;
}