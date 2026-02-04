import { FastifyReply, FastifyRequest } from "fastify";
import { CreateFighterUseCase } from "../../application/use-cases/admin/CreateFighterUseCase.js";
import { PrismaFighterRepository } from "../../infrastructure/database/repositories/PrismaFighterRepository.js";

export class CreateFighterController {
    async handle(request: FastifyRequest, reply: FastifyReply) {
        const { name, nickname, image_url } = request.body as any;

        if (!name) {
            return reply.status(400).send({ error: "Name is required" });
        }

        const repository = new PrismaFighterRepository();
        const useCase = new CreateFighterUseCase(repository);

        try {
            const fighter = await useCase.execute({ name, nickname, image_url });
            return reply.status(201).send(fighter);
        } catch (error: any) {
            return reply.status(500).send({ error: error.message });
        }
    }
}
