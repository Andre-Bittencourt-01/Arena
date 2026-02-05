import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../infrastructure/database/client.js";

export class UpdateFightsOrderController {
    async handle(request: FastifyRequest, reply: FastifyReply) {
        try {
            const body = request.body as any;
            const orders = body.orders;

            if (!orders || !Array.isArray(orders)) {
                return reply.status(400).send({ error: "Invalid payload: 'orders' array required." });
            }

            console.log(`[REORDER] Recebida atualização de lote para ${orders.length} lutas.`);

            // OTIMIZAÇÃO: Prisma Transaction
            await prisma.$transaction(
                orders.map((item: any) => prisma.fight.update({
                    where: { id: item.id },
                    data: { order: Number(item.order) }
                }))
            );

            console.log(`[REORDER] Banco de dados sincronizado com sucesso (Transaction).`);
            return reply.status(200).send({ message: "Ordem atualizada com sucesso" });
        } catch (error: any) {
            console.error('[REORDER ERROR]', error);
            return reply.status(500).send({ error: error.message });
        }
    }
}
