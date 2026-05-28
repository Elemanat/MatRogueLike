import type { Problem } from '../../types/game';
import type { ApiProblemDto } from './contracts';

export function mapProblemDtoToProblem(dto: ApiProblemDto): Problem {
  return {
    id: dto.id,
    question: dto.prompt,
    correctAnswer: dto.correctAnswers[0] ?? '',
    wrongAnswers: dto.wrongAnswers,
    allCorrectAnswers: dto.correctAnswers,
  };
}



