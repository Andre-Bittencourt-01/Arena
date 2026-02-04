import { FastifyInstance } from "fastify";
import { AdminEventController } from "../../../presentation/controllers/AdminEventController.js";
import { CreateFighterController } from "../../../presentation/controllers/CreateFighterController.js";
import { CreateEventController } from "../../../presentation/controllers/CreateEventController.js";
import { UpdateEventController } from "../../../presentation/controllers/UpdateEventController.js";
import { CreateFightController } from "../../../presentation/controllers/CreateFightController.js";
import { UpdateFightController } from "../../../presentation/controllers/UpdateFightController.js";
import { GetFightersController } from "../../../presentation/controllers/GetFightersController.js";
import { GetAllEventsController } from "../../../presentation/controllers/GetAllEventsController.js";
import { verifyJwt } from "../../../infrastructure/http/middlewares/verifyJwt.js";
import { verifyAdmin, verifyAdminSecret } from "../../../infrastructure/http/middlewares/verifyAdmin.js";

import { DeleteEventController } from "../../../presentation/controllers/DeleteEventController.js";

const adminEventController = new AdminEventController();
const createFighterController = new CreateFighterController();
const createEventController = new CreateEventController();
const createFightController = new CreateFightController();
const getFightersController = new GetFightersController();
const updateEventController = new UpdateEventController();
const updateFightController = new UpdateFightController();
const getAllEventsController = new GetAllEventsController();
const deleteEventController = new DeleteEventController();

export async function adminRoutes(server: FastifyInstance) {
    // All routes in this file require JWT and Admin role
    server.addHook('preHandler', verifyJwt);
    server.addHook('preHandler', verifyAdmin);

    // Standard Admin CRUD Routes
    server.post('/events', (req, reply) => createEventController.handle(req, reply));
    server.get('/events', (req, reply) => getAllEventsController.handle(req, reply));
    server.put('/events/:id', (req, reply) => updateEventController.handle(req, reply));
    server.delete('/events/:id', (req, reply) => deleteEventController.handle(req, reply));

    server.post('/fighters', (req, reply) => createFighterController.handle(req, reply));
    server.get('/fighters', (req, reply) => getFightersController.handle(req, reply));
    server.post('/fights', (req, reply) => createFightController.handle(req, reply));
    server.put('/fights/:id', (req, reply) => updateFightController.handle(req, reply));

    // Critical Admin Routes (Require Secret Header)
    server.post('/events/:eventId/results',
        { preHandler: [verifyAdminSecret] },
        (req, reply) => adminEventController.processResults(req as any, reply)
    );
}
