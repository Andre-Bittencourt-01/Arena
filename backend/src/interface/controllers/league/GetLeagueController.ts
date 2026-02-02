import { FastifyReply, FastifyRequest } from "fastify";
import { GetLeagueUseCase } from "../../../application/use-cases/league/GetLeagueUseCase.js";
import { PrismaLeagueRepository } from "../../../infra/database/repositories/PrismaLeagueRepository.js";

const leagueRepository = new PrismaLeagueRepository();
const getLeagueUseCase = new GetLeagueUseCase(leagueRepository);

interface GetLeagueParams {
    id: string;
}

export class GetLeagueController {
    async handle(request: FastifyRequest<{ Params: GetLeagueParams }>, reply: FastifyReply) {
        try {
            const { id } = request.params;
            const league = await getLeagueUseCase.execute(id);
            return reply.status(200).send(league);
        } catch (error: any) {
            if (error.message === "League not found") {
                return reply.status(404).send({ error: error.message });
            }
            console.error(error);
            return reply.status(500).send({ error: error.message || "Internal Server Error" });
        }
    }
}
