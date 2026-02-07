import { FastifyReply, FastifyRequest } from "fastify";
import { ListLeaguesUseCase } from "../../../application/use-cases/league/ListLeaguesUseCase.js";
import { PrismaLeagueRepository } from "../../../infrastructure/database/repositories/PrismaLeagueRepository.js";
import { PrismaUserRepository } from "../../../infrastructure/database/repositories/PrismaUserRepository.js";

const leagueRepository = new PrismaLeagueRepository();
const userRepository = new PrismaUserRepository();
const listLeaguesUseCase = new ListLeaguesUseCase(leagueRepository, userRepository);

export class ListLeaguesController {
    async handle(request: FastifyRequest, reply: FastifyReply) {
        try {
            const userId = (request as any).user?.id || (request as any).user?.sub;
            const leagues = await listLeaguesUseCase.execute(userId);
            return reply.status(200).send(leagues);
        } catch (error: any) {
            console.error(error);
            return reply.status(500).send({ error: error.message || "Internal Server Error" });
        }
    }
}
