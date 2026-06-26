import type {
    NextProblemRequest,
    NextProblemResponse,
    RunAnswerRequest,
    RunAnswerResponse,
    RunStartRequest,
    RunStartResponse,
    PlayerStatsResponse,
    LoginByCodeResponse,
    RecoverCodeRequest,
    RecoverCodeResponse,
    RegisterNewPlayerRequest,
    RegisterNewPlayerResponse,
} from './contracts';

export interface RunsApi {
    startRun(request: RunStartRequest): Promise<RunStartResponse>;

    answer(request: RunAnswerRequest): Promise<RunAnswerResponse>;

    finishRun(runId: string): Promise<{ status: string }>;
}

export interface ProblemsApi {
    getNext(request: NextProblemRequest): Promise<NextProblemResponse>;
}

export interface PlayersApi {
    getStats(playerName: string): Promise<PlayerStatsResponse>;

    loginByCode(code: string): Promise<LoginByCodeResponse>;

    registerNewPlayer(request: RegisterNewPlayerRequest): Promise<RegisterNewPlayerResponse>;

    recoverCode(request: RecoverCodeRequest): Promise<RecoverCodeResponse>;
}

export interface ApiClient {
    runs: RunsApi;
    problems: ProblemsApi;
    players: PlayersApi;
}