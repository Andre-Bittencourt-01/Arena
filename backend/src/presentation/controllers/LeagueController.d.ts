import { FastifyReply, FastifyRequest } from "fastify";
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
export declare class LeagueController {
    list(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    getLeaderboard(request: FastifyRequest<{
        Params: LeagueParams;
    }>, reply: FastifyReply): Promise<never>;
    create(request: FastifyRequest<{
        Body: CreateLeagueBody;
    }>, reply: FastifyReply): Promise<never>;
    join(request: FastifyRequest<{
        Body: JoinLeagueBody;
        Params: LeagueParams;
    }>, reply: FastifyReply): Promise<never>;
    getUserLeagues(request: FastifyRequest<{
        Params: {
            userId: string;
        };
    }>, reply: FastifyReply): Promise<never>;
}
export {};
