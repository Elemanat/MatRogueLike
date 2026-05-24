import type { ApiClient } from './client';
import type {
  ApiProblemDto,
  NextProblemRequest,
  NextProblemResponse,
  RunAnswerRequest,
  RunAnswerResponse,
  RunStartRequest,
  RunStartResponse,
} from './contracts';

const MOCK_PROBLEMS: ApiProblemDto[] = [
  { id: 'm1', prompt: '1/2 + 1/4 = ?', correctAnswers: ['3/4'], wrongAnswers: ['1/2', '1/6'], topic: 'fractions', difficulty: 1 },
  { id: 'm2', prompt: '3/4 - 1/4 = ?', correctAnswers: ['1/2', '2/4'], wrongAnswers: ['1/4', '1/6'], topic: 'fractions', difficulty: 1 },
  { id: 'm3', prompt: '8 x 9 = ?', correctAnswers: ['72'], wrongAnswers: ['63', '81'], topic: 'times', difficulty: 2 },
];

function pickProblem(topic: string): ApiProblemDto {
  const scoped = MOCK_PROBLEMS.filter(p => p.topic === topic);
  const base = scoped.length > 0 ? scoped : MOCK_PROBLEMS;
  return base[Math.floor(Math.random() * base.length)];
}

export function createMockApiClient(): ApiClient {
  return {
    runs: {
      async startRun(request: RunStartRequest): Promise<RunStartResponse> {
        return {
          runId: `mock-${request.towerId}-${Date.now()}`,
          startedAt: new Date().toISOString(),
          initialProblem: pickProblem(request.towerId),
        };
      },
      async answer(request: RunAnswerRequest): Promise<RunAnswerResponse> {
        const problem = MOCK_PROBLEMS.find(p => p.id === request.problemId);
        const isCorrect = Boolean(problem?.correctAnswers.includes(request.answer));
        return {
          isCorrect,
          state: 'CONTINUE',
          nextProblem: pickProblem(problem?.topic ?? 'fractions'),
        };
      },
    },
    problems: {
      async getNext(request: NextProblemRequest): Promise<NextProblemResponse> {
        return { problem: pickProblem(request.towerId) };
      },
    },
  };
}

