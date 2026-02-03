import { FastifyReply, FastifyRequest } from "fastify";
import { CreateFightUseCase } from "../../application/use-cases/admin/CreateFightUseCase.js";
import { PrismaFightRepository } from "../../infra/database/repositories/PrismaFightRepository.js";
import { CreateFightDTO } from "../../domain/repositories/IFightRepository.js";

export class CreateFightController {
    async handle(request: FastifyRequest, reply: FastifyReply) {
        try {
            console.log('[DEBUG API] Payload Recebido (CreateFight):', request.body);

            const {
                event_id,
                fighter_a_id,
                fighter_b_id,
                rounds,
                is_title,
                category
            } = request.body as any;

            // Validate required fields
            if (!event_id || !fighter_a_id || !fighter_b_id) {
                console.error('[CreateFight] Missing fields:', { event_id, fighter_a_id, fighter_b_id });
                return reply.status(400).send({ error: "Missing required fields: event_id, fighter_a_id or fighter_b_id" });
            }

            const repository = new PrismaFightRepository();
            const useCase = new CreateFightUseCase(repository);

            const createFightDTO: CreateFightDTO = {
                event_id,
                fighter_a_id,
                fighter_b_id,
                rounds: rounds || 3,
                is_title: is_title || false,
                category: category || "Preliminary Card"
            };

            const createdFight = await useCase.execute(createFightDTO);

            return reply.status(201).send(createdFight);
        } catch (error: any) {
            console.error(error);
            return reply.status(500).send({ error: error.message || "Internal Server Error" });
        }
    }
}
