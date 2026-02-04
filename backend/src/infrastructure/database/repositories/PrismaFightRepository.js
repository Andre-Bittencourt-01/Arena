import { prisma } from '../client.js';
export class PrismaFightRepository {
    async findByIdWithEvent(id) {
        return await prisma.fight.findUnique({
            where: { id },
            include: { event: true }
        });
    }
    async update(id, data) {
        await prisma.fight.update({
            where: { id },
            data
        });
    }
}
//# sourceMappingURL=PrismaFightRepository.js.map