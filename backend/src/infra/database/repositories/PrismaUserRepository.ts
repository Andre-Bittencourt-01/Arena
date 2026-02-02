import { IUserRepository } from '../../../domain/repositories/IUserRepository.js';
import { User } from "@prisma/client";
import { prisma } from '../client.js';

export class PrismaUserRepository implements IUserRepository {
    async findById(id: string): Promise<User | null> {
        return await prisma.user.findUnique({
            where: { id }
        });
    }

    async findByEmail(email: string): Promise<User | null> {
        return await prisma.user.findUnique({
            where: { email }
        });
    }

    async incrementPoints(userId: string, points: number): Promise<void> {
        await prisma.user.update({
            where: { id: userId },
            data: {
                points: { increment: points },
                monthly_points: { increment: points },
                yearly_points: { increment: points }
            }
        });
    }

    async update(userId: string, data: Partial<User>): Promise<void> {
        await prisma.user.update({
            where: { id: userId },
            data
        });
    }
}


