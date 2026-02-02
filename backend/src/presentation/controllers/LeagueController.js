import { CreateLeagueUseCase } from '../../domain/useCases/league/CreateLeagueUseCase.js';
import { JoinLeagueUseCase } from '../../domain/useCases/league/JoinLeagueUseCase.js';
import { GetLeagueLeaderboardUseCase } from '../../domain/useCases/league/GetLeagueLeaderboardUseCase.js';
import { GetUserLeaguesUseCase } from '../../domain/useCases/league/GetUserLeaguesUseCase.js';
import { ListLeaguesUseCase } from '../../domain/useCases/league/ListLeaguesUseCase.js';
import { PrismaLeagueRepository } from '../../infra/database/repositories/PrismaLeagueRepository.js';
const leagueRepository = new PrismaLeagueRepository();
const createLeagueUseCase = new CreateLeagueUseCase(leagueRepository);
const joinLeagueUseCase = new JoinLeagueUseCase(leagueRepository);
const getLeagueLeaderboardUseCase = new GetLeagueLeaderboardUseCase(leagueRepository);
const getUserLeaguesUseCase = new GetUserLeaguesUseCase(leagueRepository);
const listLeaguesUseCase = new ListLeaguesUseCase(leagueRepository);
export class LeagueController {
    async list(request, reply) {
        try {
            const leagues = await listLeaguesUseCase.execute();
            return reply.status(200).send(leagues);
        }
        catch (error) {
            console.error(error);
            return reply.status(500).send({ error: error.message || "Internal Server Error" });
        }
    }
    async getLeaderboard(request, reply) {
        try {
            const { id } = request.params;
            const leaderboard = await getLeagueLeaderboardUseCase.execute(id);
            return reply.status(200).send(leaderboard);
        }
        catch (error) {
            console.error(error);
            return reply.status(500).send({ error: error.message || "Internal Server Error" });
        }
    }
    async create(request, reply) {
        try {
            const { name, description, ownerId } = request.body;
            if (!name || !ownerId) {
                return reply.status(400).send({ error: "Name and ownerId are required" });
            }
            const league = await createLeagueUseCase.execute({
                name,
                description,
                ownerId
            });
            return reply.status(201).send(league);
        }
        catch (error) {
            console.error(error);
            return reply.status(500).send({ error: error.message || "Internal Server Error" });
        }
    }
    async join(request, reply) {
        try {
            const { id } = request.params;
            const { userId } = request.body;
            if (!id || !userId) {
                return reply.status(400).send({ error: "League ID and userId are required" });
            }
            const membership = await joinLeagueUseCase.execute({
                leagueId: id,
                userId
            });
            return reply.status(200).send(membership);
        }
        catch (error) {
            console.error(error);
            return reply.status(500).send({ error: error.message || "Internal Server Error" });
        }
    }
    async getUserLeagues(request, reply) {
        try {
            const { userId } = request.params;
            const leagues = await getUserLeaguesUseCase.execute(userId);
            return reply.status(200).send(leagues);
        }
        catch (error) {
            console.error(error);
            return reply.status(500).send({ error: error.message || "Internal Server Error" });
        }
    }
}
//# sourceMappingURL=LeagueController.js.map