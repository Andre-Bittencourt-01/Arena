import { FastifyInstance } from "fastify";
import { GetEventFightsController } from "../../../presentation/controllers/GetEventFightsController.js";

const getEventFightsController = new GetEventFightsController();

export async function eventRoutes(server: FastifyInstance) {
    // Public routes for event data (cards/fights)
    server.get('/:id/fights', (req, reply) => getEventFightsController.handle(req, reply));
}
