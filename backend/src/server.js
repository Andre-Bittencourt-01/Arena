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
const server = Fastify({
    logger: true
});
await server.register(cors, {
    origin: true // In development, allow all origins
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
server.post('/leagues', leagueController.create);
server.post('/leagues/:id/join', leagueController.join);
server.get('/leagues/:id/leaderboard', leagueController.getLeaderboard);
server.get('/users/:userId/leagues', leagueController.getUserLeagues);
// Event Routes
server.get('/events/upcoming', eventController.getUpcoming);
// Pick Routes
server.post('/picks', pickController.save);
server.get('/events/:eventId/my-picks', pickController.getUserPicks);
// Auth Routes
server.post('/auth/sync-youtube', { preHandler: [verifyJwt] }, (req, res) => authController.syncYoutube(req, res));
server.get('/me', { preHandler: [verifyJwt] }, authController.me);
server.get('/auth/mock/:id', authController.mockToken); // Para facilitar testes
// Admin Routes
server.post('/admin/events/:eventId/results', adminController.processResults);
const start = async () => {
    try {
        const port = process.env.PORT ? parseInt(process.env.PORT) : 3333;
        await server.listen({ port, host: '0.0.0.0' });
        console.log(`Backend server is running on http://localhost:${port}`);
    }
    catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};
start();
//# sourceMappingURL=server.js.map