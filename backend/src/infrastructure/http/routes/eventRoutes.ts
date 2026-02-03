import { FastifyInstance } from "fastify";
import { GetEventFightsController } from "../../../presentation/controllers/GetEventFightsController.js";

import { EventController } from "../../../presentation/controllers/EventController.js";

import { PickController } from "../../../presentation/controllers/PickController.js";
import { verifyJwt } from "../../../infra/http/middlewares/verifyJwt.js";

const getEventFightsController = new GetEventFightsController();
const eventController = new EventController();
const pickController = new PickController();

export async function eventRoutes(server: FastifyInstance) {
    // Public routes for event data (cards/fights)
    server.get('/', (req, reply) => eventController.list(req, reply));
    server.get('/upcoming', (req, reply) => eventController.getUpcoming(req, reply));
    server.get('/:id/fights', (req, reply) => getEventFightsController.handle(req, reply));

    // Auth routes for user data relative to event
    server.get('/:eventId/my-picks', { preHandler: [verifyJwt] }, (req, reply) => pickController.getUserPicks(req as any, reply));
}
