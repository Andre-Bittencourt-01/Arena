import { FastifyReply, FastifyRequest } from "fastify";
import { CreateFightUseCase } from "../../application/use-cases/admin/CreateFightUseCase.js";
import { PrismaFightRepository } from "../../infra/database/repositories/PrismaFightRepository.js";
import { CreateFightDTO } from "../../domain/repositories/IFightRepository.js";

export class CreateFightController {
    async handle(request: FastifyRequest, reply: FastifyReply) {
        try {
            console.log('[DEBUG API] Payload Recebido (CreateFight):', request.body);

            const {
                eventId, event_id,
                fighterAId, fighter_a_id,
                fighterBId, fighter_b_id,
                rounds,
                isTitle, is_title,
                category
            } = request.body as any;

            // Normalização
            const validEventId = eventId || event_id;
            const validFighterAId = fighterAId || fighter_a_id;
            const validFighterBId = fighterBId || fighter_b_id;
            const validIsTitle = isTitle !== undefined ? isTitle : is_title;

            // Validate required fields
            if (!validEventId || !validFighterAId || !validFighterBId) {
                console.error('[CreateFight] Missing fields:', { validEventId, validFighterAId, validFighterBId });
                return reply.status(400).send({ error: "Missing required fields: eventId, fighterAId or fighterBId" });
            }

            const repository = new PrismaFightRepository();
            const useCase = new CreateFightUseCase(repository);

            const createFightDTO: CreateFightDTO = {
                eventId: validEventId,
                fighterAId: validFighterAId,
                fighterBId: validFighterBId,
                rounds: rounds || 3,
                isTitle: validIsTitle || false,
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
