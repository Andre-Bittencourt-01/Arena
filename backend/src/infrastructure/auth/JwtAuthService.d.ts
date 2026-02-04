import { AuthUser, IAuthService } from '../../domain/interfaces/IAuthService.js';
export declare class JwtAuthService implements IAuthService {
    private secret;
    constructor();
    generateToken(user: AuthUser): string;
    verifyToken(token: string): AuthUser | null;
}
