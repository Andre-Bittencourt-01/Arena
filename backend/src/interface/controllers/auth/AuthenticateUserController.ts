import { FastifyReply, FastifyRequest } from "fastify";
import { AuthenticateUserUseCase } from "../../../application/use-cases/auth/AuthenticateUserUseCase.js";
import { PrismaUserRepository } from "../../../infrastructure/database/repositories/PrismaUserRepository.js";
import { JwtAuthService } from "../../../infrastructure/auth/JwtAuthService.js";

const userRepository = new PrismaUserRepository();
const authService = new JwtAuthService();
const authenticateUserUseCase = new AuthenticateUserUseCase(userRepository, authService);

interface LoginBody {
    email: string;
    password?: string;
}

export class AuthenticateUserController {
    async handle(request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) {
        try {
            console.log("Recebendo tentativa de login de:", request.ip);
            const { email, password } = request.body;

            const result = await authenticateUserUseCase.execute({
                email,
                password
            });

            return reply.status(200).send(result);
        } catch (error: any) {
            console.error(error);
            return reply.status(401).send({ error: error.message || "Invalid credentials" });
        }
    }
}
