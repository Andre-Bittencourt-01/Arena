import { FastifyInstance } from "fastify";
import { AuthenticateUserController } from "../../../interface/controllers/auth/AuthenticateUserController.js";

import { AuthController } from "../../../presentation/controllers/AuthController.js";
import { verifyJwt } from "../../../infra/http/middlewares/verifyJwt.js";

const authenticateUserController = new AuthenticateUserController();
const authController = new AuthController();

export async function authRoutes(server: FastifyInstance) {
    server.post('/login', authenticateUserController.handle);
    server.get('/me', { preHandler: [verifyJwt] }, (req, reply) => authController.me(req, reply));
}
