import { FastifyReply, FastifyRequest } from "fastify";
import { UpdateFightUseCase } from "../../application/use-cases/admin/UpdateFightUseCase.js";
import { PrismaFightRepository } from "../../infra/database/repositories/PrismaFightRepository.js";

export class UpdateFightController {
    async handle(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id } = request.params as { id: string };
            const body = request.body as any;

            console.log(`[DEBUG API] Atualizando luta ID: ${id}`, body);

            // 1. Extração de IDs (Tenta direto, se não, tenta dentro do objeto)
            let finalFighterAId = body.fighterAId || body.fighter_a_id;
            if (!finalFighterAId && body.fighterA?.id) finalFighterAId = body.fighterA.id;

            let finalFighterBId = body.fighterBId || body.fighter_b_id;
            if (!finalFighterBId && body.fighterB?.id) finalFighterBId = body.fighterB.id;

            // 2. Correção do Vencedor (Se vier Nome, descobre o ID)
            let finalWinnerId = body.winnerId || body.winner_id;
            // Se o winnerId for igual ao NOME do lutador A, usa o ID do lutador A
            // Comparação case-insensitive para garantir
            if (body.fighterA?.name && finalWinnerId && typeof finalWinnerId === 'string' && finalWinnerId.toLowerCase() === body.fighterA.name.toLowerCase()) {
                finalWinnerId = finalFighterAId;
            }
            if (body.fighterB?.name && finalWinnerId && typeof finalWinnerId === 'string' && finalWinnerId.toLowerCase() === body.fighterB.name.toLowerCase()) {
                finalWinnerId = finalFighterBId;
            }
            // Se for string vazia ou 'Unknown', vira null
            if (!finalWinnerId || finalWinnerId === 'Unknown' || finalWinnerId === 'unknown') finalWinnerId = null;

            // Robust Mapping (CamelCase <-> SnakeCase)
            const eventId = body.eventId || body.event_id;
            const result = body.result; // Repository normalizes toUpperCase
            const method = body.method;
            const rounds = body.rounds;
            const isTitle = body.isTitle !== undefined ? body.isTitle : body.is_title;
            const category = body.category;
            const roundEnd = body.roundEnd || body.round_end;
            const time = body.time;
            const status = body.status;
            const order = body.order;

            const repository = new PrismaFightRepository();
            const useCase = new UpdateFightUseCase(repository);

            await useCase.execute({
                id,
                eventId,
                fighterAId: finalFighterAId,
                fighterBId: finalFighterBId,
                rounds,
                isTitle: !!isTitle,
                category,
                winnerId: finalWinnerId,
                result,
                method,
                roundEnd,
                time,
                status,
                order
            });

            return reply.status(200).send({ message: "Fight updated successfully" });

        } catch (error: any) {
            console.error('[UpdateFight] Error:', error);
            return reply.status(400).send({ error: error.message });
        }
    }
}
