import Fastify from 'fastify';
import cors from '@fastify/cors';
import { LeagueController } from './presentation/controllers/LeagueController.js';
import { PickController } from './presentation/controllers/PickController.js';
import { AdminEventController } from './presentation/controllers/AdminEventController.js';
import { EventController } from './presentation/controllers/EventController.js';
import { AuthController } from './presentation/controllers/AuthController.js';
import { verifyJwt } from './infrastructure/http/middlewares/verifyJwt.js';

const server = Fastify({
    logger: true
});

await server.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
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
import { leagueRoutes } from './infrastructure/http/routes/leagueRoutes.js';
server.register(leagueRoutes);

// Auth Routes
import { authRoutes } from './infrastructure/http/routes/authRoutes.js';
server.register(authRoutes, { prefix: 'auth' });

// User Routes
import { userRoutes } from './infrastructure/http/routes/userRoutes.js';
server.register(userRoutes);

// Admin & Event Routes
import { adminRoutes } from './infrastructure/http/routes/adminRoutes.js';
import { eventRoutes } from './infrastructure/http/routes/eventRoutes.js';
import { pickRoutes } from './infrastructure/http/routes/pickRoutes.js';
import { fighterRoutes } from './infrastructure/http/routes/fighterRoutes.js';

server.register(eventRoutes, { prefix: 'events' });
server.register(adminRoutes, { prefix: 'admin' });
server.register(pickRoutes, { prefix: 'picks' });
server.register(fighterRoutes, { prefix: 'fighters' });

const start = async () => {
    try {
        const port = process.env.PORT ? parseInt(process.env.PORT) : 3333;
        const host = process.env.HOST || '0.0.0.0';
        await server.listen({ port, host });
        console.log(`Backend server is running on http://localhost:${port}`);
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();


