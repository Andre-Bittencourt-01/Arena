import { FastifyInstance } from "fastify";
import { PickController } from "../../../presentation/controllers/PickController.js";
import { verifyJwt } from "../../../infra/http/middlewares/verifyJwt.js";

const pickController = new PickController();

export async function pickRoutes(server: FastifyInstance) {
    server.addHook('preHandler', verifyJwt);

    server.post('/', (req, reply) => pickController.save(req as any, reply));
    server.post('/batch', (req, reply) => pickController.saveBatch(req as any, reply));
}
