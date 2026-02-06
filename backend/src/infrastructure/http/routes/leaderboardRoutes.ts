import { FastifyInstance } from "fastify";
import { GetGlobalLeaderboardController } from "../../../interface/controllers/leaderboard/GetGlobalLeaderboardController.js";

const getGlobalLeaderboardController = new GetGlobalLeaderboardController();

export async function leaderboardRoutes(server: FastifyInstance) {
    server.get('/leaderboard', (req, reply) => getGlobalLeaderboardController.handle(req, reply));
}
