import { FastifyReply, FastifyRequest } from "fastify";
import { GetAllFightersUseCase } from "../../application/use-cases/admin/GetAllFightersUseCase.js";
import { PrismaFighterRepository } from "../../infra/database/repositories/PrismaFighterRepository.js";

export class GetFightersController {
    async handle(request: FastifyRequest, reply: FastifyReply) {
        try {
            const repository = new PrismaFighterRepository();
            const useCase = new GetAllFightersUseCase(repository);

            const fighters = await useCase.execute();
            console.log('[DEBUG API] Lutadores retornados:', JSON.stringify(fighters[0], null, 2));

            return reply.status(200).send(fighters);
        } catch (error: any) {
            console.error(error);
            return reply.status(500).send({ error: error.message || "Internal Server Error" });
        }
    }
}
