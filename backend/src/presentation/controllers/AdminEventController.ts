import { FastifyReply, FastifyRequest } from "fastify";
import { ProcessEventResultsUseCase } from '../../domain/useCases/event/ProcessEventResultsUseCase.js';
import { PrismaFightRepository } from '../../infrastructure/database/repositories/PrismaFightRepository.js';
import { PrismaPickRepository } from '../../infrastructure/database/repositories/PrismaPickRepository.js';
import { PrismaUserRepository } from '../../infrastructure/database/repositories/PrismaUserRepository.js';
import { ScoringService } from '../../domain/services/ScoringService.js';

const fightRepository = new PrismaFightRepository();
const pickRepository = new PrismaPickRepository();
const userRepository = new PrismaUserRepository();
const scoringService = new ScoringService();

const processEventResultsUseCase = new ProcessEventResultsUseCase(
    fightRepository,
    pickRepository,
    userRepository,
    scoringService
);

interface ProcessResultsParams {
    eventId: string;
}

interface FightResult {
    fight_id: string;
    winner_id: string;
    method: string;
    round: string;
}

interface ProcessResultsBody {
    results: FightResult[];
}

export class AdminEventController {
    async processResults(request: FastifyRequest<{ Params: ProcessResultsParams, Body: ProcessResultsBody }>, reply: FastifyReply) {
        try {
            const { eventId } = request.params;
            const { results } = request.body;

            await processEventResultsUseCase.execute({
                eventId,
                results
            });

            return reply.status(200).send({ message: "Event results processed successfully" });
        } catch (error: any) {
            console.error(error);
            return reply.status(500).send({ error: error.message || "Internal Server Error" });
        }
    }
}


