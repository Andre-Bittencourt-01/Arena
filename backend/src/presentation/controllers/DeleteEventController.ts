import { FastifyReply, FastifyRequest } from "fastify";
import { DeleteEventUseCase } from '../../domain/useCases/event/DeleteEventUseCase.js';
import { PrismaEventRepository } from '../../infrastructure/database/repositories/PrismaEventRepository.js';

const eventRepository = new PrismaEventRepository();
const deleteEventUseCase = new DeleteEventUseCase(eventRepository);

export class DeleteEventController {
    async handle(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };

        try {
            await deleteEventUseCase.execute(id);
            return reply.status(204).send(); // 204 No Content
        } catch (error: any) {
            console.error(error);
            if (error.message === "Event not found") {
                return reply.status(404).send({ error: "Event not found" });
            }
            return reply.status(500).send({ error: error.message || "Internal Server Error" });
        }
    }
}
