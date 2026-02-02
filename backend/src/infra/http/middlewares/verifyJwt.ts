import { FastifyReply, FastifyRequest } from "fastify";
import { JwtAuthService } from '../../auth/JwtAuthService.js';

const authService = new JwtAuthService();

export async function verifyJwt(request: FastifyRequest, reply: FastifyReply) {
    try {
        const authHeader = request.headers.authorization;

        if (!authHeader) {
            return reply.status(401).send({ error: "Unauthorized: Missing Token" });
        }

        const [, token] = authHeader.split(" ");
        const decoded = authService.verifyToken(token);

        if (!decoded) {
            return reply.status(401).send({ error: "Unauthorized: Invalid Token" });
        }

        // Adiciona o usuário ao request para uso posterior
        (request as any).user = decoded;
    } catch (error) {
        return reply.status(401).send({ error: "Unauthorized" });
    }
}


