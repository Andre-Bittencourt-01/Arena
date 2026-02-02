export class AuthenticateUserUseCase {
    userRepository;
    authService;
    constructor(userRepository, authService) {
        this.userRepository = userRepository;
        this.authService = authService;
    }
    async execute({ email, password }) {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error("Invalid credentials");
        }
        // Simple check for developement/seed data
        if (user.password_hash !== password) {
            throw new Error("Invalid credentials");
        }
        const token = this.authService.generateToken({ id: user.id, email: user.email });
        // Remove password_hash from user object
        const { password_hash, ...userWithoutPassword } = user;
        return {
            user: userWithoutPassword,
            token
        };
    }
}
//# sourceMappingURL=AuthenticateUserUseCase.js.map