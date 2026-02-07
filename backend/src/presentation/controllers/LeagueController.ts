import { FastifyReply, FastifyRequest } from "fastify";
import { CreateLeagueUseCase } from '../../domain/useCases/league/CreateLeagueUseCase.js';
import { JoinLeagueUseCase } from '../../domain/useCases/league/JoinLeagueUseCase.js';
import { GetLeagueLeaderboardUseCase } from '../../domain/useCases/league/GetLeagueLeaderboardUseCase.js';
import { GetUserLeaguesUseCase } from '../../domain/useCases/league/GetUserLeaguesUseCase.js';
import { ListLeaguesUseCase } from '../../domain/useCases/league/ListLeaguesUseCase.js';

import { PrismaLeagueRepository } from '../../infrastructure/database/repositories/PrismaLeagueRepository.js';
import { PrismaUserRepository } from '../../infrastructure/database/repositories/PrismaUserRepository.js';

const leagueRepository = new PrismaLeagueRepository();
const userRepository = new PrismaUserRepository();
const createLeagueUseCase = new CreateLeagueUseCase(leagueRepository);
const joinLeagueUseCase = new JoinLeagueUseCase(leagueRepository);
const getLeagueLeaderboardUseCase = new GetLeagueLeaderboardUseCase(leagueRepository);
const getUserLeaguesUseCase = new GetUserLeaguesUseCase(leagueRepository);
const listLeaguesUseCase = new ListLeaguesUseCase(leagueRepository, userRepository);

interface CreateLeagueBody {
    name: string;
    description?: string;
    owner_id: string;
}

interface JoinLeagueBody {
    user_id: string;
}

interface LeagueParams {
    id: string;
}

export class LeagueController {
    async list(request: FastifyRequest, reply: FastifyReply) {
        try {
            const userId = (request as any).user?.id || (request as any).user?.sub;
            const leagues = await listLeaguesUseCase.execute(userId);
            return reply.status(200).send(leagues);
        } catch (error: any) {
            console.error(error);
            return reply.status(500).send({ error: error.message || "Internal Server Error" });
        }
    }

    async getLeaderboard(request: FastifyRequest<{ Params: LeagueParams, Querystring: { eventId?: string, month?: string, year?: string } }>, reply: FastifyReply) {
        try {
            const { id } = request.params;
            const { eventId, month, year } = request.query || {};
            const leaderboard = await getLeagueLeaderboardUseCase.execute(id, { eventId, month, year });
            return reply.status(200).send(leaderboard);
        } catch (error: any) {
            console.error(error);
            return reply.status(200).send([]);
        }
    }

    async create(request: FastifyRequest<{ Body: CreateLeagueBody }>, reply: FastifyReply) {
        try {
            const { name, description, owner_id } = request.body;

            if (!name || !owner_id) {
                return reply.status(400).send({ error: "Name and owner_id are required" });
            }

            const league = await createLeagueUseCase.execute({
                name,
                description,
                owner_id
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
            const { user_id } = request.body;

            if (!id || !user_id) {
                return reply.status(400).send({ error: "League ID and user_id are required" });
            }

            const membership = await joinLeagueUseCase.execute({
                league_id: id,
                user_id
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


