import { FastifyInstance } from "fastify";
import { AuthenticateUserController } from "../../../interface/controllers/auth/AuthenticateUserController.js";

const authenticateUserController = new AuthenticateUserController();

export async function authRoutes(server: FastifyInstance) {
    server.post('/login', authenticateUserController.handle);
}
