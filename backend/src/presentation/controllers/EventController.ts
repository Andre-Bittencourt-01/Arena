import { FastifyReply, FastifyRequest } from "fastify";
import { GetUpcomingEventsUseCase } from '../../domain/useCases/event/GetUpcomingEventsUseCase.js';
import { PrismaEventRepository } from '../../infrastructure/database/repositories/PrismaEventRepository.js';
import { ListEventsUseCase } from '../../domain/useCases/event/ListEventsUseCase.js';

const eventRepository = new PrismaEventRepository();
const getUpcomingEventsUseCase = new GetUpcomingEventsUseCase(eventRepository);
const listEventsUseCase = new ListEventsUseCase(eventRepository);

export class EventController {
    async getUpcoming(request: FastifyRequest, reply: FastifyReply) {
        try {
            const events = await getUpcomingEventsUseCase.execute();
            return reply.status(200).send(events);
        } catch (error: any) {
            console.error(error);
            return reply.status(500).send({ error: error.message || "Internal Server Error" });
        }
    }

    async list(request: FastifyRequest, reply: FastifyReply) {
        try {
            const events = await listEventsUseCase.execute();
            return reply.status(200).send(events);
        } catch (error: any) {
            console.error(error);
            return reply.status(500).send({ error: error.message || "Internal Server Error" });
        }
    }
}


