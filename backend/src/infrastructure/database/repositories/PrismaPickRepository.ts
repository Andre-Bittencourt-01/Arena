import { Pick } from "@prisma/client";
import { IPickRepository, SavePickDTO } from '../../../domain/repositories/IPickRepository.js';
import { prisma } from '../client.js';

export class PrismaPickRepository implements IPickRepository {
    async save(data: SavePickDTO): Promise<Pick> {
        return await prisma.pick.upsert({
            where: {
                user_id_fight_id: {
                    user_id: data.user_id,
                    fight_id: data.fight_id
                }
            },
            create: {
                user_id: data.user_id,
                fight_id: data.fight_id,
                event_id: data.event_id,
                fighter_id: data.fighter_id,
                method: data.method,
                round: data.round
            },
            update: {
                fighter_id: data.fighter_id,
                method: data.method,
                round: data.round
            }
        });
    }

    async saveBatch(data: SavePickDTO[]): Promise<void> {
        await prisma.$transaction(
            data.map(pick =>
                prisma.pick.upsert({
                    where: {
                        user_id_fight_id: {
                            user_id: pick.user_id,
                            fight_id: pick.fight_id
                        }
                    },
                    create: {
                        user_id: pick.user_id,
                        fight_id: pick.fight_id,
                        event_id: pick.event_id,
                        fighter_id: pick.fighter_id,
                        method: pick.method,
                        round: pick.round
                    },
                    update: {
                        fighter_id: pick.fighter_id,
                        method: pick.method,
                        round: pick.round
                    }
                })
            )
        );
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


