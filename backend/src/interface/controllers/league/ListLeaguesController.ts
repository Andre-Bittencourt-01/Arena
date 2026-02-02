import { FastifyReply, FastifyRequest } from "fastify";
import { ListLeaguesUseCase } from "../../../application/use-cases/league/ListLeaguesUseCase.js";
import { PrismaLeagueRepository } from "../../../infra/database/repositories/PrismaLeagueRepository.js";

const leagueRepository = new PrismaLeagueRepository();
const listLeaguesUseCase = new ListLeaguesUseCase(leagueRepository);

export class ListLeaguesController {
    async handle(request: FastifyRequest, reply: FastifyReply) {
        try {
            const leagues = await listLeaguesUseCase.execute();
            return reply.status(200).send(leagues);
        } catch (error: any) {
            console.error(error);
            return reply.status(500).send({ error: error.message || "Internal Server Error" });
        }
    }
}
