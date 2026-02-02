import { FastifyInstance } from "fastify";
import { GetUserLeaguesController } from "../../../interface/controllers/league/GetUserLeaguesController.js";

const getUserLeaguesController = new GetUserLeaguesController();

export async function userRoutes(server: FastifyInstance) {
    server.get('/users/:userId/leagues', getUserLeaguesController.handle);
}
