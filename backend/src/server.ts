import Fastify from 'fastify';
import cors from '@fastify/cors';
import { LeagueController } from './presentation/controllers/LeagueController.js';
import { PickController } from './presentation/controllers/PickController.js';
import { AdminEventController } from './presentation/controllers/AdminEventController.js';
import { EventController } from './presentation/controllers/EventController.js';
import { AuthController } from './presentation/controllers/AuthController.js';
import { verifyJwt } from './infra/http/middlewares/verifyJwt.js';
import { leagueRoutes } from './infrastructure/http/routes/leagueRoutes.js';

import { authRoutes } from './infrastructure/http/routes/authRoutes.js';
import { userRoutes } from './infrastructure/http/routes/userRoutes.js';

const server = Fastify({
    logger: true
});

await server.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
});

const leagueController = new LeagueController();
const pickController = new PickController();
const adminController = new AdminEventController();
const eventController = new EventController();
const authController = new AuthController();

// Health Check
server.get('/', async (request, reply) => {
    return { status: 'ok', message: 'Arena MMA Backend is running (Fastify)' };
});

// League Routes
server.register(leagueRoutes);

// Auth Routes
server.register(authRoutes);
server.register(userRoutes);

// Admin Routes
import { adminRoutes } from './infrastructure/http/routes/adminRoutes.js';
import { eventRoutes } from './infrastructure/http/routes/eventRoutes.js';
server.register(eventRoutes, { prefix: 'events' });
server.register(adminRoutes, { prefix: 'admin' });

const start = async () => {
    try {
        const port = process.env.PORT ? parseInt(process.env.PORT) : 3333;
        await server.listen({ port, host: '0.0.0.0' });
        console.log(`Backend server is running on http://localhost:${port}`);
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();


