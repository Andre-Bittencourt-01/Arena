import { FastifyReply, FastifyRequest } from "fastify";
import { GetUserLeaguesUseCase } from "../../../domain/useCases/league/GetUserLeaguesUseCase.js";
import { PrismaLeagueRepository } from "../../../infrastructure/database/repositories/PrismaLeagueRepository.js";
import { PrismaUserRepository } from "../../../infrastructure/database/repositories/PrismaUserRepository.js";

const leagueRepository = new PrismaLeagueRepository();
const userRepository = new PrismaUserRepository();
const getUserLeaguesUseCase = new GetUserLeaguesUseCase(leagueRepository, userRepository);

export class GetUserLeaguesController {
    async handle(request: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply) {
        try {
            const { userId } = request.params;
            const requestingUserId = (request as any).user?.id || (request as any).user?.sub;
            const leagues = await getUserLeaguesUseCase.execute(userId, requestingUserId);
            return reply.status(200).send(leagues);
        } catch (error: any) {
            console.error(error);
            return reply.status(500).send({ error: error.message || "Internal Server Error" });
        }
    }
}
