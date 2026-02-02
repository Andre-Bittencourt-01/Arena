import { FastifyReply, FastifyRequest } from "fastify";
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

interface CreateLeagueBody {
    name: string;
    description?: string;
    ownerId: string;
}

interface JoinLeagueBody {
    userId: string;
}

interface LeagueParams {
    id: string;
}

export class LeagueController {
    async list(request: FastifyRequest, reply: FastifyReply) {
        try {
            const leagues = await listLeaguesUseCase.execute();
            return reply.status(200).send(leagues);
        } catch (error: any) {
            console.error(error);
            return reply.status(500).send({ error: error.message || "Internal Server Error" });
        }
    }

    async getLeaderboard(request: FastifyRequest<{ Params: LeagueParams }>, reply: FastifyReply) {
        try {
            const { id } = request.params;
            const leaderboard = await getLeagueLeaderboardUseCase.execute(id);
            return reply.status(200).send(leaderboard);
        } catch (error: any) {
            console.error(error);
            return reply.status(500).send({ error: error.message || "Internal Server Error" });
        }
    }

    async create(request: FastifyRequest<{ Body: CreateLeagueBody }>, reply: FastifyReply) {
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
        } catch (error: any) {
            console.error(error);
            return reply.status(500).send({ error: error.message || "Internal Server Error" });
        }
    }

    async join(request: FastifyRequest<{ Body: JoinLeagueBody, Params: LeagueParams }>, reply: FastifyReply) {
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
        } catch (error: any) {
            console.error(error);
            return reply.status(500).send({ error: error.message || "Internal Server Error" });
        }
    }

    async getUserLeagues(request: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply) {
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


