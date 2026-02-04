import { FastifyInstance } from "fastify";
import { ListLeaguesController } from "../../../interface/controllers/league/ListLeaguesController.js";
import { GetLeagueController } from "../../../interface/controllers/league/GetLeagueController.js";
import { UpdateLeagueController } from "../../../interface/controllers/league/UpdateLeagueController.js";
import { LeagueController } from "../../../presentation/controllers/LeagueController.js";
import { verifyJwt } from "../../../infrastructure/http/middlewares/verifyJwt.js";

const listLeaguesController = new ListLeaguesController();
const getLeagueController = new GetLeagueController();
const updateLeagueController = new UpdateLeagueController();
const leagueController = new LeagueController();

export async function leagueRoutes(server: FastifyInstance) {
    server.get('/leagues', listLeaguesController.handle);
    server.get('/leagues/:id', getLeagueController.handle);
    server.get('/leagues/:id/leaderboard', (req, reply) => leagueController.getLeaderboard(req as any, reply));
    server.put('/leagues/:id', { preHandler: [verifyJwt] }, (req, reply) => updateLeagueController.handle(req as any, reply));
}
