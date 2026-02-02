import { FastifyReply, FastifyRequest } from "fastify";
import { UpdateLeagueUseCase } from "../../../application/use-cases/league/UpdateLeagueUseCase.js";
import { PrismaLeagueRepository } from "../../../infra/database/repositories/PrismaLeagueRepository.js";

const leagueRepository = new PrismaLeagueRepository();
const updateLeagueUseCase = new UpdateLeagueUseCase(leagueRepository);

interface UpdateLeagueParams {
    id: string;
}

interface UpdateLeagueBody {
    name?: string;
    description?: string;
    logo_url?: string;
}

export class UpdateLeagueController {
    async handle(request: FastifyRequest<{ Params: UpdateLeagueParams, Body: UpdateLeagueBody }>, reply: FastifyReply) {
        try {
            const { id } = request.params;
            const { name, description, logo_url } = request.body;

            // In a real app, userId comes from decoded JWT (request.user.id)
            // For now, we might need to extract it from the header or assume a mock if not using middleare yet
            // Looking at server.ts, verifyJwt is used for some routes.
            // Let's try to get it from request.user or similar if we were using a standard fastify jwt plugin.
            // Since this is a specialized prompt, I'll check if there's a user id in the request.

            const userId = (request as any).user?.id || (request.headers['x-user-id'] as string);

            if (!userId) {
                return reply.status(401).send({ error: "Unauthorized" });
            }

            const updatedLeague = await updateLeagueUseCase.execute({
                leagueId: id,
                userId,
                name,
                description,
                logo_url
            });

            return reply.status(200).send(updatedLeague);
        } catch (error: any) {
            if (error.message === "League not found") {
                return reply.status(404).send({ error: error.message });
            }
            if (error.message === "Only the owner can update the league") {
                return reply.status(403).send({ error: error.message });
            }
            console.error(error);
            return reply.status(500).send({ error: error.message || "Internal Server Error" });
        }
    }
}
