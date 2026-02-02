import { FastifyInstance } from "fastify";
import { ListLeaguesController } from "../../../interface/controllers/league/ListLeaguesController.js";
import { GetLeagueController } from "../../../interface/controllers/league/GetLeagueController.js";
import { UpdateLeagueController } from "../../../interface/controllers/league/UpdateLeagueController.js";
import { verifyJwt } from "../../../infra/http/middlewares/verifyJwt.js";

const listLeaguesController = new ListLeaguesController();
const getLeagueController = new GetLeagueController();
const updateLeagueController = new UpdateLeagueController();

export async function leagueRoutes(server: FastifyInstance) {
    server.get('/leagues', listLeaguesController.handle);
    server.get('/leagues/:id', getLeagueController.handle);
    server.put('/leagues/:id', { preHandler: [verifyJwt] }, (req, reply) => updateLeagueController.handle(req as any, reply));
}
