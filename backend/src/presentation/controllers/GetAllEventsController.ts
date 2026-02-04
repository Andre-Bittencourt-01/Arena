import { FastifyReply, FastifyRequest } from "fastify";
import { GetAllEventsUseCase } from "../../application/use-cases/admin/GetAllEventsUseCase.js";
import { PrismaEventRepository } from "../../infrastructure/database/repositories/PrismaEventRepository.js";

export class GetAllEventsController {
    async handle(request: FastifyRequest, reply: FastifyReply) {
        const repository = new PrismaEventRepository();
        const useCase = new GetAllEventsUseCase(repository);

        const events = await useCase.execute();

        return reply.status(200).send(events);
    }
}
