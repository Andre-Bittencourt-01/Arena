import { FastifyReply, FastifyRequest } from "fastify";
import { UpdateFightUseCase } from "../../application/use-cases/admin/UpdateFightUseCase.js";
import { PrismaFightRepository } from "../../infrastructure/database/repositories/PrismaFightRepository.js";

export class UpdateFightController {
    async handle(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id } = request.params as { id: string };
            const body = request.body as any;

            console.log(`[DEBUG API] Atualizando luta ID: ${id}`, body);

            // System wide unification: Use snake_case
            const fight_data = {
                id,
                event_id: body.event_id,
                fighter_a_id: body.fighter_a_id,
                fighter_b_id: body.fighter_b_id,
                rounds: body.rounds,
                is_title: body.is_title,
                category: body.category,
                winner_id: body.winner_id,
                result: body.result,
                method: body.method,
                round_end: body.round_end,
                time: body.time
            };

            const repository = new PrismaFightRepository();
            const useCase = new UpdateFightUseCase(repository);

            await useCase.execute(fight_data);

            return reply.status(200).send({ message: "Fight updated successfully" });

        } catch (error: any) {
            console.error('[UpdateFight] Error:', error);
            return reply.status(400).send({ error: error.message });
        }
    }
}
