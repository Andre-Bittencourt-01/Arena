import { FastifyReply, FastifyRequest } from "fastify";

export async function verifyAdmin(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user;

    if (!user) {
        return reply.status(401).send({ error: "Unauthorized: User not identified" });
    }

    // Role Logic: Verify if role is OWNER or ADMIN
    const isAdmin = user.role === 'OWNER' || user.role === 'ADMIN';

    if (!isAdmin) {
        return reply.status(403).send({ error: "Forbidden: Administrative access required" });
    }
}

/**
 * Enhanced check for critical operations that requires the x-admin-secret header
 */
export async function verifyAdminSecret(request: FastifyRequest, reply: FastifyReply) {
    // First ensure they are an admin
    await verifyAdmin(request, reply);
    if (reply.sent) return;

    const adminSecret = request.headers['x-admin-secret'];
    const expectedSecret = process.env.ADMIN_SECRET || 'arena-mma-secret-2025';

    if (adminSecret !== expectedSecret) {
        return reply.status(401).send({ error: "Unauthorized: Invalid administrative secret" });
    }
}
