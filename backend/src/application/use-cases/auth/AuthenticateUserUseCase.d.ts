import { User } from "@prisma/client";
import { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import { IAuthService } from "../../../domain/interfaces/IAuthService.js";
interface AuthenticateRequest {
    email: string;
    password?: string;
}
interface AuthenticateResponse {
    user: Omit<User, 'password_hash'>;
    token: string;
}
export declare class AuthenticateUserUseCase {
    private userRepository;
    private authService;
    constructor(userRepository: IUserRepository, authService: IAuthService);
    execute({ email, password }: AuthenticateRequest): Promise<AuthenticateResponse>;
}
export {};
