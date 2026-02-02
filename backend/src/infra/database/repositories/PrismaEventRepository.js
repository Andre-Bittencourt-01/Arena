import { prisma } from '../client.js';
export class PrismaEventRepository {
    async findUpcoming() {
        return await prisma.event.findMany({
            where: {
                date: { gt: new Date() }
            },
            include: {
                fights: true
            },
            orderBy: {
                date: 'asc'
            }
        });
    }
    async findById(id) {
        return await prisma.event.findUnique({
            where: { id }
        });
    }
}
//# sourceMappingURL=PrismaEventRepository.js.map