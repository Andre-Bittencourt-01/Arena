export interface AuthUser {
    id: string;
    email: string;
}
export interface IAuthService {
    /**
     * Generates a JWT token for the user.
     */
    generateToken(user: AuthUser): string;
    /**
     * Verifies and decodes a JWT token.
     */
    verifyToken(token: string): AuthUser | null;
}
