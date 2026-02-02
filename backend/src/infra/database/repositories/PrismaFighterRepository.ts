import { Fighter } from "@prisma/client";
import { IFighterRepository } from "../../../domain/repositories/IFighterRepository.js";
import { prisma } from "../client.js";

export class PrismaFighterRepository implements IFighterRepository {
    async create(data: Omit<Fighter, 'id' | 'wins' | 'losses' | 'draws' | 'nc'>): Promise<Fighter> {
        // Simple slug generation for ID if not provided (or we can use uuid)
        // Here we'll use a slug-like ID based on name for consistency with existing data
        const id = data.name.toLowerCase().replace(/\s+/g, '_');

        return await prisma.fighter.create({
            data: {
                id,
                ...data
            }
        });
    }

    async findById(id: string): Promise<Fighter | null> {
        return await prisma.fighter.findUnique({
            where: { id }
        });
    }

    async findAll(): Promise<any[]> {
        const prismaFighters = await prisma.fighter.findMany({
            orderBy: { name: 'asc' }
        });

        return prismaFighters.map(f => ({
            id: f.id,
            name: f.name,
            nickname: f.nickname || '',
            imageUrl: f.image_url || '',
            wins: f.wins,
            losses: f.losses,
            draws: f.draws,
            nc: f.nc
        }));
    }
}
