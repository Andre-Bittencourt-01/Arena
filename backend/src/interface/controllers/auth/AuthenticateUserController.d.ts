import { FastifyReply, FastifyRequest } from "fastify";
interface LoginBody {
    email: string;
    password?: string;
}
export declare class AuthenticateUserController {
    handle(request: FastifyRequest<{
        Body: LoginBody;
    }>, reply: FastifyReply): Promise<never>;
}
export {};
