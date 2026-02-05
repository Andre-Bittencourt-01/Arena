import { FastifyReply, FastifyRequest } from "fastify";
import { UpdateFightUseCase } from "../../application/use-cases/admin/UpdateFightUseCase.js";
import { PrismaFightRepository } from "../../infrastructure/database/repositories/PrismaFightRepository.js";

export class UpdateFightController {
    async handle(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id } = request.params as { id: string };
            const body = request.body as any;

            console.log(`[DEBUG API] Updating Fight Lock/Info ID: ${id}`, {
                lock_status: body.lock_status,
                order: body.order
            });

            const fight_data = {
                id,
                event_id: body.event_id,
                fighter_a_id: body.fighter_a_id,
                fighter_b_id: body.fighter_b_id,
                category: body.category,
                weight_class: body.weight_class,
                rounds: body.rounds,
                status: body.status,
                order: body.order,
                video_url: body.video_url,
                is_title: body.is_title,
                winner_id: body.winner_id,
                method: body.method,
                result: body.result,
                round_end: body.round_end,
                time: body.time || body.time_end,

                // Betting Lock Fields (Required for the UI feature)
                points: body.points,
                lock_status: body.lock_status,
                custom_lock_time: body.custom_lock_time
            };

            const repository = new PrismaFightRepository();
            const useCase = new UpdateFightUseCase(repository);

            await useCase.execute(fight_data);

            return reply.status(200).send({ message: "Fight updated successfully" });

        } catch (error: any) {
            console.error('[UpdateFight] Error:', error);
            return reply.status(500).send({ error: error.message });
        }
    }
}
