import { User } from "@prisma/client";
import { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import { IAuthService } from "../../../domain/interfaces/IAuthService.js";
import { compare } from "bcryptjs";

interface AuthenticateRequest {
    email: string;
    password?: string;
}

interface AuthenticateResponse {
    user: Omit<User, 'password_hash'>;
    token: string;
}

export class AuthenticateUserUseCase {
    constructor(
        private userRepository: IUserRepository,
        private authService: IAuthService
    ) { }

    async execute({ email, password }: AuthenticateRequest): Promise<AuthenticateResponse> {
        console.log(`\n🔍 [DEBUG AUTH] Tentando login com email: ${email}`);

        const user = await this.userRepository.findByEmail(email);

        if (!user) {
            console.log("❌ [DEBUG AUTH] Usuário NÃO encontrado no banco.");
            throw new Error("Invalid credentials");
        }

        console.log("✅ [DEBUG AUTH] Usuário encontrado no banco.");

        if (!user.password_hash) {
            console.log("❌ [DEBUG AUTH] Usuário não possui password_hash armazenado.");
            throw new Error("Invalid credentials");
        }

        console.log(`📄 [DEBUG AUTH] Hash armazenado (primeiros 10 chars): ${user.password_hash.substring(0, 10)}...`);

        try {
            console.log("⚖️ [DEBUG AUTH] Comparando senha com bcrypt...");
            const isPasswordValid = await compare(password || "", user.password_hash);

            console.log(`📊 [DEBUG AUTH] Resultado da comparação bcrypt: ${isPasswordValid}`);

            if (!isPasswordValid) {
                console.log("❌ [DEBUG AUTH] Senha inválida.");
                throw new Error("Invalid credentials");
            }
        } catch (error: any) {
            console.error("🚨 [DEBUG AUTH] Erro fatal durante bcrypt.compare:", error.message);
            throw error;
        }

        console.log("🎫 [DEBUG AUTH] Gerando Token...");
        const token = this.authService.generateToken({
            id: user.id,
            email: user.email,
            role: (user as any).role || 'MEMBER'
        });

        console.log("🚀 [DEBUG AUTH] Login bem sucedido!");

        // Remove password_hash from user object
        const { password_hash, ...userWithoutPassword } = user;

        return {
            user: userWithoutPassword,
            token
        };
    }
}
