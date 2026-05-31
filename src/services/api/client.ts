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

export interface ApiClient {
  runs: {
    startRun(request: RunStartRequest): Promise<RunStartResponse>;
    answer(request: RunAnswerRequest): Promise<RunAnswerResponse>;
  };
  problems: {
    getNext(request: NextProblemRequest): Promise<NextProblemResponse>;
  };
  players: {
    getStats(playerName: string): Promise<PlayerStatsResponse>;
  };
}
