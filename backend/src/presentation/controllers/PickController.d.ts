import { FastifyReply, FastifyRequest } from "fastify";
interface SavePickBody {
    userId: string;
    fightId: string;
    eventId: string;
    fighterId: string;
    method: string;
    round: string;
}
interface UserPicksParams {
    eventId: string;
}
interface UserPicksQuery {
    userId: string;
}
export declare class PickController {
    getUserPicks(request: FastifyRequest<{
        Params: UserPicksParams;
        Querystring: UserPicksQuery;
    }>, reply: FastifyReply): Promise<never>;
    save(request: FastifyRequest<{
        Body: SavePickBody;
    }>, reply: FastifyReply): Promise<never>;
}
export {};
