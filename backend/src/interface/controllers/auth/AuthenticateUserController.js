import { AuthenticateUserUseCase } from "../../../application/use-cases/auth/AuthenticateUserUseCase.js";
import { PrismaUserRepository } from "../../../infra/database/repositories/PrismaUserRepository.js";
import { JwtAuthService } from "../../../infra/auth/JwtAuthService.js";
const userRepository = new PrismaUserRepository();
const authService = new JwtAuthService();
const authenticateUserUseCase = new AuthenticateUserUseCase(userRepository, authService);
export class AuthenticateUserController {
    async handle(request, reply) {
        try {
            const { email, password } = request.body;
            const result = await authenticateUserUseCase.execute({
                email,
                password
            });
            return reply.status(200).send(result);
        }
        catch (error) {
            console.error(error);
            return reply.status(401).send({ error: error.message || "Invalid credentials" });
        }
    }
}
//# sourceMappingURL=AuthenticateUserController.js.map