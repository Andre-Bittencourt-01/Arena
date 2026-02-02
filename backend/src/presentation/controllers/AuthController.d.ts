import { FastifyReply, FastifyRequest } from "fastify";
interface SyncBody {
    googleToken: string;
}
interface LoginBody {
    email: string;
    password?: string;
}
export declare class AuthController {
    syncYoutube(request: FastifyRequest<{
        Body: SyncBody;
    }>, reply: FastifyReply): Promise<never>;
    me(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    login(request: FastifyRequest<{
        Body: LoginBody;
    }>, reply: FastifyReply): Promise<never>;
    mockToken(request: FastifyRequest<{
        Params: {
            id: string;
        };
    }>, reply: FastifyReply): Promise<never>;
}
export {};
