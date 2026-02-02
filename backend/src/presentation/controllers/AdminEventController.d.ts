import { FastifyReply, FastifyRequest } from "fastify";
interface ProcessResultsParams {
    eventId: string;
}
interface FightResult {
    fightId: string;
    winnerId: string;
    method: string;
    round: string;
}
interface ProcessResultsBody {
    results: FightResult[];
}
export declare class AdminEventController {
    processResults(request: FastifyRequest<{
        Params: ProcessResultsParams;
        Body: ProcessResultsBody;
    }>, reply: FastifyReply): Promise<never>;
}
export {};
