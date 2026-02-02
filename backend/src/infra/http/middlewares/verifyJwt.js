import { JwtAuthService } from '../../auth/JwtAuthService.js';
const authService = new JwtAuthService();
export async function verifyJwt(request, reply) {
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
        request.user = decoded;
    }
    catch (error) {
        return reply.status(401).send({ error: "Unauthorized" });
    }
}
//# sourceMappingURL=verifyJwt.js.map