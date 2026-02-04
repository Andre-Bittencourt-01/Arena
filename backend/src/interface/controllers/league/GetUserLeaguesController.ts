import { FastifyReply, FastifyRequest } from "fastify";
import { GetUserLeaguesUseCase } from "../../../domain/useCases/league/GetUserLeaguesUseCase.js";
import { PrismaLeagueRepository } from "../../../infrastructure/database/repositories/PrismaLeagueRepository.js";

const leagueRepository = new PrismaLeagueRepository();
const getUserLeaguesUseCase = new GetUserLeaguesUseCase(leagueRepository);

export class GetUserLeaguesController {
    async handle(request: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply) {
        try {
            const { userId } = request.params;
            const leagues = await getUserLeaguesUseCase.execute(userId);
            return reply.status(200).send(leagues);
        } catch (error: any) {
            console.error(error);
            return reply.status(500).send({ error: error.message || "Internal Server Error" });
        }
    }
}
