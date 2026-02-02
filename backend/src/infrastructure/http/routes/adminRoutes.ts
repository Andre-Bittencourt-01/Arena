import { FastifyInstance } from "fastify";
import { AdminEventController } from "../../../presentation/controllers/AdminEventController.js";
import { CreateFighterController } from "../../../presentation/controllers/CreateFighterController.js";
import { CreateEventController } from "../../../presentation/controllers/CreateEventController.js";
import { UpdateEventController } from "../../../presentation/controllers/UpdateEventController.js";
import { GetAllEventsController } from "../../../presentation/controllers/GetAllEventsController.js";
import { verifyJwt } from "../../../infra/http/middlewares/verifyJwt.js";
import { verifyAdmin, verifyAdminSecret } from "../../../infra/http/middlewares/verifyAdmin.js";

const adminEventController = new AdminEventController();
const createFighterController = new CreateFighterController();
const createEventController = new CreateEventController();
const updateEventController = new UpdateEventController();
const getAllEventsController = new GetAllEventsController();

export async function adminRoutes(server: FastifyInstance) {
    // All routes in this file require JWT and Admin role
    server.addHook('preHandler', verifyJwt);
    server.addHook('preHandler', verifyAdmin);

    // Standard Admin CRUD Routes
    server.post('/events', (req, reply) => createEventController.handle(req, reply));
    server.get('/events', (req, reply) => getAllEventsController.handle(req, reply));
    server.put('/events/:id', (req, reply) => updateEventController.handle(req, reply));
    server.post('/fighters', (req, reply) => createFighterController.handle(req, reply));

    // Critical Admin Routes (Require Secret Header)
    server.post('/events/:eventId/results',
        { preHandler: [verifyAdminSecret] },
        (req, reply) => adminEventController.processResults(req as any, reply)
    );
}
