import { Pick } from "@prisma/client";
import { IPickRepository, SavePickDTO } from '../../../domain/repositories/IPickRepository.js';
import { prisma } from '../client.js';

export class PrismaPickRepository implements IPickRepository {
    async save(data: SavePickDTO): Promise<Pick> {
        return await prisma.pick.upsert({
            where: {
                user_id_fight_id: {
                    user_id: data.userId,
                    fight_id: data.fightId
                }
            },
            create: {
                user_id: data.userId,
                fight_id: data.fightId,
                event_id: data.eventId,
                fighter_id: data.fighterId,
                method: data.method,
                round: data.round
            },
            update: {
                fighter_id: data.fighterId,
                method: data.method,
                round: data.round
            }
        });
    }

    async findByUserAndEvent(userId: string, eventId: string): Promise<Pick[]> {
        return await prisma.pick.findMany({
            where: {
                user_id: userId,
                event_id: eventId
            }
        });
    }

    async findByEvent(eventId: string): Promise<Pick[]> {
        return await prisma.pick.findMany({
            where: {
                event_id: eventId
            }
        });
    }

    async updatePoints(pickId: string, points: number): Promise<void> {
        await prisma.pick.update({
            where: { id: pickId },
            data: {
                points_earned: points
            }
        });
    }
}


