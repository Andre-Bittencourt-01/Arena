import { FastifyReply, FastifyRequest } from "fastify";
import { SavePickUseCase } from '../../domain/useCases/pick/SavePickUseCase.js';
import { GetUserPicksUseCase } from '../../domain/useCases/pick/GetUserPicksUseCase.js';
import { PrismaPickRepository } from '../../infra/database/repositories/PrismaPickRepository.js';
import { PrismaFightRepository } from '../../infra/database/repositories/PrismaFightRepository.js';

const pickRepository = new PrismaPickRepository();
const fightRepository = new PrismaFightRepository();
const savePickUseCase = new SavePickUseCase(pickRepository, fightRepository);
const getUserPicksUseCase = new GetUserPicksUseCase(pickRepository);

interface SavePickBody {
    userId: string;
    fightId: string;
    eventId: string;
    fighterId: string;
    method: string;
    round: string;
}

interface UserPicksParams {
    eventId: string;
}

interface UserPicksQuery {
    userId: string;
}

export class PickController {
    async getUserPicks(request: FastifyRequest<{ Params: UserPicksParams, Querystring: UserPicksQuery }>, reply: FastifyReply) {
        try {
            const { eventId } = request.params;
            const { userId } = request.query;

            const picks = await getUserPicksUseCase.execute({ userId, eventId });
            return reply.status(200).send(picks);
        } catch (error: any) {
            console.error(error);
            return reply.status(500).send({ error: error.message || "Internal Server Error" });
        }
    }

    async save(request: FastifyRequest<{ Body: SavePickBody }>, reply: FastifyReply) {
        try {
            const pick = await savePickUseCase.execute(request.body);
            return reply.status(201).send(pick);
        } catch (error: any) {
            const status = error.message.includes("closed") ? 403 : 400;
            return reply.status(status).send({ error: error.message });
        }
    }
}


