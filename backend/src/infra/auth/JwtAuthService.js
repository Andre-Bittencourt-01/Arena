import jwt from "jsonwebtoken";
export class JwtAuthService {
    secret;
    constructor() {
        this.secret = process.env.JWT_SECRET || "default-secret-change-me";
    }
    generateToken(user) {
        return jwt.sign({ sub: user.id, email: user.email }, this.secret, { expiresIn: "7d" });
    }
    verifyToken(token) {
        try {
            const decoded = jwt.verify(token, this.secret);
            return {
                id: decoded.sub,
                email: decoded.email
            };
        }
        catch (error) {
            return null;
        }
    }
}
//# sourceMappingURL=JwtAuthService.js.map