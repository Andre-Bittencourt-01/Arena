import { FastifyReply, FastifyRequest } from "fastify";
import { SyncYoutubeStatusUseCase } from '../../domain/useCases/auth/SyncYoutubeStatusUseCase.js';
import { PrismaUserRepository } from '../../infrastructure/database/repositories/PrismaUserRepository.js';
import { GoogleYouTubeProvider } from '../../infrastructure/providers/GoogleYouTubeProvider.js';
import { JwtAuthService } from '../../infrastructure/auth/JwtAuthService.js';

const userRepository = new PrismaUserRepository();
const youtubeProvider = new GoogleYouTubeProvider();
const authService = new JwtAuthService();
const syncYoutubeStatusUseCase = new SyncYoutubeStatusUseCase(userRepository, youtubeProvider);

interface SyncBody {
    google_token: string;
}

interface LoginBody {
    email: string;
    password?: string;
}

export class AuthController {
    // Sincroniza status do YouTube
    async syncYoutube(request: FastifyRequest<{ Body: SyncBody }>, reply: FastifyReply) {
        try {
            const user = (request as any).user;
            const { google_token: googleToken } = request.body;

            await syncYoutubeStatusUseCase.execute({
                user_id: user.id,
                google_token: googleToken
            });

            return reply.status(200).send({ message: "Sync successful" });
        } catch (error: any) {
            console.error(error);
            return reply.status(400).send({ error: error.message });
        }
    }

    // Endpoint para teste de login/me
    async me(request: FastifyRequest, reply: FastifyReply) {
        try {
            const authUser = (request as any).user;
            const user = await userRepository.findById(authUser.id);

            if (!user) {
                return reply.status(404).send({ error: "User not found" });
            }

            return reply.status(200).send(user);
        } catch (error: any) {
            return reply.status(500).send({ error: error.message });
        }
    }

    async login(request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) {
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

            const token = authService.generateToken({
                id: user.id,
                email: user.email,
                role: (user as any).role || 'MEMBER'
            });
            return reply.status(200).send({ token, user });
        } catch (error: any) {
            return reply.status(500).send({ error: error.message });
        }
    }

    // Apenas para fins de teste, gera um token mockado para um ID
    async mockToken(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        const { id } = request.params;
        const user = await userRepository.findById(id);

        if (!user) return reply.status(404).send({ error: "User not found" });

        const token = authService.generateToken({
            id: user.id,
            email: user.email,
            role: (user as any).role || 'MEMBER'
        });
        return reply.status(200).send({ token });
    }
}


