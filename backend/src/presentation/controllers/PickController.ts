import { FastifyReply, FastifyRequest } from "fastify";
import { SavePickUseCase } from '../../domain/useCases/pick/SavePickUseCase.js';
import { SaveBatchPicksUseCase } from '../../domain/useCases/pick/SaveBatchPicksUseCase.js';
import { GetUserPicksUseCase } from '../../domain/useCases/pick/GetUserPicksUseCase.js';
import { PrismaPickRepository } from '../../infrastructure/database/repositories/PrismaPickRepository.js';
import { PrismaFightRepository } from '../../infrastructure/database/repositories/PrismaFightRepository.js';

const pickRepository = new PrismaPickRepository();
const fightRepository = new PrismaFightRepository();
const savePickUseCase = new SavePickUseCase(pickRepository, fightRepository);
const getUserPicksUseCase = new GetUserPicksUseCase(pickRepository);
const saveBatchPicksUseCase = new SaveBatchPicksUseCase(pickRepository, fightRepository);

interface SavePickBody {
    user_id: string;
    fight_id: string;
    event_id: string;
    fighter_id: string;
    method: string;
    round: string;
}

interface UserPicksParams {
    eventId: string; // URL param usually follows route definition, let's see routes next
}

interface UserPicksQuery {
    user_id: string;
}

export class PickController {
    async getUserPicks(request: FastifyRequest<{ Params: UserPicksParams, Querystring: UserPicksQuery }>, reply: FastifyReply) {
        try {
            const { eventId } = request.params;
            const { user_id: userId } = request.query;

            const picks = await getUserPicksUseCase.execute({ userId, eventId });
            return reply.status(200).send(picks);
        } catch (error: any) {
            console.error(error);
            return reply.status(500).send({ error: error.message || "Internal Server Error" });
        }
    }

    async save(request: FastifyRequest<{ Body: SavePickBody }>, reply: FastifyReply) {
        try {
            const user_id = (request as any).user.id;
            const pickData = { ...request.body, user_id };
            const pick = await savePickUseCase.execute(pickData);
            return reply.status(201).send(pick);
        } catch (error: any) {
            const status = error.message.includes("closed") ? 403 : 400;
            return reply.status(status).send({ error: error.message });
        }
    }

    async saveBatch(request: FastifyRequest<{ Body: { picks: Omit<SavePickBody, 'user_id'>[] } }>, reply: FastifyReply) {
        try {
            const user_id = (request as any).user.id;
            const { picks } = request.body;

            const picksWithUser = picks.map(p => ({
                ...p,
                user_id
            }));

            await saveBatchPicksUseCase.execute(picksWithUser as any);
            return reply.status(201).send({ message: "Picks saved successfully" });
        } catch (error: any) {
            const status = error.message.includes("closed") ? 403 : 400;
            return reply.status(status).send({ error: error.message });
        }
    }
}


