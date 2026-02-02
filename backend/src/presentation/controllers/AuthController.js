import { SyncYoutubeStatusUseCase } from '../../domain/useCases/auth/SyncYoutubeStatusUseCase.js';
import { PrismaUserRepository } from '../../infra/database/repositories/PrismaUserRepository.js';
import { GoogleYouTubeProvider } from '../../infra/providers/GoogleYouTubeProvider.js';
import { JwtAuthService } from '../../infra/auth/JwtAuthService.js';
const userRepository = new PrismaUserRepository();
const youtubeProvider = new GoogleYouTubeProvider();
const authService = new JwtAuthService();
const syncYoutubeStatusUseCase = new SyncYoutubeStatusUseCase(userRepository, youtubeProvider);
export class AuthController {
    // Sincroniza status do YouTube
    async syncYoutube(request, reply) {
        try {
            const user = request.user;
            const { googleToken } = request.body;
            await syncYoutubeStatusUseCase.execute({
                userId: user.id,
                googleToken
            });
            return reply.status(200).send({ message: "Sync successful" });
        }
        catch (error) {
            console.error(error);
            return reply.status(400).send({ error: error.message });
        }
    }
    // Endpoint para teste de login/me
    async me(request, reply) {
        try {
            const authUser = request.user;
            const user = await userRepository.findById(authUser.id);
            if (!user) {
                return reply.status(404).send({ error: "User not found" });
            }
            return reply.status(200).send(user);
        }
        catch (error) {
            return reply.status(500).send({ error: error.message });
        }
    }
    async login(request, reply) {
        try {
            const { email, password } = request.body;
            const user = await userRepository.findByEmail(email);
            if (!user) {
                return reply.status(401).send({ error: "Invalid credentials" });
            }
            // Simple check since it's a seed with plain text password
            if (user.password_hash !== password) {
                return reply.status(401).send({ error: "Invalid credentials" });
            }
            const token = authService.generateToken({ id: user.id, email: user.email });
            return reply.status(200).send({ token, user });
        }
        catch (error) {
            return reply.status(500).send({ error: error.message });
        }
    }
    // Apenas para fins de teste, gera um token mockado para um ID
    async mockToken(request, reply) {
        const { id } = request.params;
        const user = await userRepository.findById(id);
        if (!user)
            return reply.status(404).send({ error: "User not found" });
        const token = authService.generateToken({ id: user.id, email: user.email });
        return reply.status(200).send({ token });
    }
}
//# sourceMappingURL=AuthController.js.map