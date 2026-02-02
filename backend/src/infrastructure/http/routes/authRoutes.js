import { AuthenticateUserController } from "../../../interface/controllers/auth/AuthenticateUserController.js";
const authenticateUserController = new AuthenticateUserController();
export async function authRoutes(server) {
    server.post('/login', authenticateUserController.handle);
}
//# sourceMappingURL=authRoutes.js.map