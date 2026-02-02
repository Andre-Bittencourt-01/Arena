import { FastifyReply, FastifyRequest } from "fastify";
import { UpdateEventUseCase } from "../../application/use-cases/admin/UpdateEventUseCase.js";
import { PrismaEventRepository } from "../../infra/database/repositories/PrismaEventRepository.js";

export class UpdateEventController {
    async handle(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as any;
        const body = request.body as any;

        const repository = new PrismaEventRepository();
        const useCase = new UpdateEventUseCase(repository);

        try {
            const event = await useCase.execute({ id, ...body });
            return reply.status(200).send(event);
        } catch (error: any) {
            if (error.message === "Event not found") {
                return reply.status(404).send({ error: error.message });
            }
            return reply.status(500).send({ error: error.message });
        }
    }
}
