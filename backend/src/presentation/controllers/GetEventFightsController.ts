import { FastifyReply, FastifyRequest } from "fastify";
import { GetEventFightsUseCase } from "../../application/use-cases/events/GetEventFightsUseCase.js";
import { PrismaFightRepository } from "../../infra/database/repositories/PrismaFightRepository.js";

export class GetEventFightsController {
    async handle(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id } = request.params as { id: string };

            const repository = new PrismaFightRepository();
            const useCase = new GetEventFightsUseCase(repository);

            const fights = await useCase.execute(id);

            return reply.status(200).send(fights);
        } catch (error: any) {
            console.error(error);
            return reply.status(500).send({ error: error.message || "Internal Server Error" });
        }
    }
}
