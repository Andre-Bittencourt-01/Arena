import { prisma } from '../client.js';
export class PrismaUserRepository {
    async findById(id) {
        return await prisma.user.findUnique({
            where: { id }
        });
    }
    async findByEmail(email) {
        return await prisma.user.findUnique({
            where: { email }
        });
    }
    async incrementPoints(userId, points) {
        await prisma.user.update({
            where: { id: userId },
            data: {
                points: { increment: points },
                monthly_points: { increment: points },
                yearly_points: { increment: points }
            }
        });
    }
    async update(userId, data) {
        await prisma.user.update({
            where: { id: userId },
            data
        });
    }
}
//# sourceMappingURL=PrismaUserRepository.js.map