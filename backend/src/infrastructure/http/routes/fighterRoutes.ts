import { FastifyInstance } from "fastify";
import { GetFightersController } from "../../../presentation/controllers/GetFightersController.js";

const getFightersController = new GetFightersController();

export async function fighterRoutes(server: FastifyInstance) {
    // Public route to get all fighters
    server.get('/', (req, reply) => getFightersController.handle(req, reply));
}
