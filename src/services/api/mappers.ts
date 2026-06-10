import type {Problem} from '../../types/game';
import type {ApiProblemDto} from './contracts';

export function mapProblemDtoToProblem(dto: ApiProblemDto): Problem {
    return {
        id: dto.id,
        prompt: dto.prompt,
        correctAnswers: dto.correctAnswers,
        wrongAnswers: dto.wrongAnswers,
        topic: dto.topic,
        difficulty: dto.difficulty,
    };
}