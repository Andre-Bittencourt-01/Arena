import jwt from "jsonwebtoken";
import { AuthUser, IAuthService } from '../../domain/interfaces/IAuthService.js';

export class JwtAuthService implements IAuthService {
    private secret: string;

    constructor() {
        this.secret = process.env.JWT_SECRET || "default-secret-change-me";
    }

    generateToken(user: AuthUser): string {
        return jwt.sign(
            { sub: user.id, email: user.email, role: user.role },
            this.secret,
            { expiresIn: "7d" }
        );
    }

    verifyToken(token: string): AuthUser | null {
        try {
            const decoded = jwt.verify(token, this.secret) as any;
            return {
                id: decoded.sub,
                sub: decoded.sub,
                email: decoded.email,
                role: decoded.role
            };
        } catch (error) {
            return null;
        }
    }
}


