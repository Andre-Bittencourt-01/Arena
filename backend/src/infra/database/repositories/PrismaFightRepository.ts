import { Fight, Event } from "@prisma/client";
import { IFightRepository } from '../../../domain/repositories/IFightRepository.js';
import { prisma } from '../client.js';

export class PrismaFightRepository implements IFightRepository {
    async findByIdWithEvent(id: string): Promise<(Fight & { event: Event }) | null> {
        return await prisma.fight.findUnique({
            where: { id },
            include: { event: true }
        });
    }

    async update(id: string, data: Partial<Fight>): Promise<void> {
        await prisma.fight.update({
            where: { id },
            data
        });
    }
}


