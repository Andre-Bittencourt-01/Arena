import { Fight, Event } from "@prisma/client";
import { IFightRepository, CreateFightDTO, UpdateFightDTO } from '../../../domain/repositories/IFightRepository.js';
import { prisma } from '../client.js';
import { randomUUID } from 'node:crypto';

export class PrismaFightRepository implements IFightRepository {
    async findByIdWithEvent(id: string): Promise<(Fight & { event: Event }) | null> {
        return await prisma.fight.findUnique({
            where: { id },
            include: { event: true }
        });
    }

    async update(id: string, data: UpdateFightDTO): Promise<Fight> {
        console.log('[DEBUG REPO] Recebido para update:', data);

        const updateData: any = {
            // Scalar Fields
            ...(data.category && { category: data.category }),
            ...(data.weight_class && { weight_class: data.weight_class }),
            ...(data.rounds && { rounds: Number(data.rounds) }),
            ...(data.status && { status: data.status }),
            ...(data.order !== undefined && { order: Number(data.order) }),
            ...(data.video_url !== undefined && { video_url: data.video_url }),
            ...(data.is_title !== undefined && { is_title: Boolean(data.is_title) }),

            // Betting / Admin
            ...(data.points !== undefined && { points: Number(data.points) }),
            ...(data.lock_status && { lock_status: data.lock_status }),
            custom_lock_time: (data.custom_lock_time && data.custom_lock_time !== "")
                ? new Date(data.custom_lock_time)
                : null,

            // Results (Scalars)
            ...(data.method !== undefined && { method: data.method }),
            ...(data.result !== undefined && { result: data.result }),
            ...(data.round_end !== undefined && {
                round_end: data.round_end ? String(data.round_end) : null
            }),
            ...(data.time !== undefined && { time: data.time }),

            // RELATIONS (Standard)
            ...(data.event_id && { event: { connect: { id: data.event_id } } }),
            ...(data.fighter_a_id && { fighter_a: { connect: { id: data.fighter_a_id } } }),
            ...(data.fighter_b_id && { fighter_b: { connect: { id: data.fighter_b_id } } }),

            // RELATION (Winner - Special Handling)
            // If ID exists -> Connect. If strictly null -> Disconnect.
            ...(data.winner_id ? { winner: { connect: { id: data.winner_id } } } : {}),
            ...(data.winner_id === null ? { winner: { disconnect: true } } : {}),
        };

        console.log('[DEBUG REPO] Dados finais para o Prisma:', updateData);

        const fight = await prisma.fight.update({
            where: { id },
            data: updateData,
            include: {
                fighter_a: true,
                fighter_b: true,
                event: true
            }
        });

        return fight;
    }

    async create(data: CreateFightDTO): Promise<Fight> {
        const fight = await prisma.fight.create({
            data: {
                id: randomUUID(),
                event_id: data.event_id,
                fighter_a_id: data.fighter_a_id,
                fighter_b_id: data.fighter_b_id,
                rounds: data.rounds,
                is_title: data.is_title,
                category: data.category,
            }
        });
        return fight;
    }
    async findByEventId(eventId: string): Promise<any[]> {
        const fights = await prisma.fight.findMany({
            where: { event_id: eventId },
            include: {
                fighter_a: true,
                fighter_b: true,
                winner: true
            },
            orderBy: [
                { order: 'asc' },
                { id: 'asc' }
            ]
        });

        // Optimization: Batch Fetch Pick Stats
        const pickStats = await prisma.pick.groupBy({
            by: ['fight_id', 'fighter_id'],
            _count: {
                id: true
            },
            where: {
                event_id: eventId
            }
        });

        // Create Lookup Map: fight_id -> fighter_id -> count
        const statsMap: Record<string, Record<string, number>> = {};
        pickStats.forEach(stat => {
            if (!statsMap[stat.fight_id]) statsMap[stat.fight_id] = {};
            statsMap[stat.fight_id][stat.fighter_id] = stat._count.id;
        });

        return fights.map(f => {
            const fighterACount = statsMap[f.id]?.[f.fighter_a_id] || 0;
            const fighterBCount = statsMap[f.id]?.[f.fighter_b_id] || 0;
            const total = fighterACount + fighterBCount;

            return {
                id: f.id,
                event_id: f.event_id,
                fighter_a_id: f.fighter_a_id,
                fighter_b_id: f.fighter_b_id,
                rounds: f.rounds,
                is_title: f.is_title,
                category: f.category,

                // Betting / Admin
                points: f.points,
                order: f.order,
                lock_status: f.lock_status,
                custom_lock_time: f.custom_lock_time,

                // Relations & Results
                winner_id: f.winner_id,
                winner: f.winner ? {
                    id: f.winner.id,
                    name: f.winner.name,
                    nickname: f.winner.nickname,
                    image_url: f.winner.image_url || ''
                } : null,
                method: f.method,
                round_end: f.round_end,
                time: f.time,
                status: f.result ? 'COMPLETED' : 'SCHEDULED',
                fighter_a: {
                    id: f.fighter_a.id,
                    name: f.fighter_a.name,
                    nickname: f.fighter_a.nickname,
                    image_url: f.fighter_a.image_url || ''
                },
                fighter_b: {
                    id: f.fighter_b.id,
                    name: f.fighter_b.name,
                    nickname: f.fighter_b.nickname,
                    image_url: f.fighter_b.image_url || ''
                },

                // Real Stats
                fighter_a_pick_pct: total > 0 ? Math.round((fighterACount / total) * 100) : 0,
                fighter_b_pick_pct: total > 0 ? Math.round((fighterBCount / total) * 100) : 0,
                total_picks: total
            };
        });
    }

    async resolveFightAndScores(fightId: string, fightData: UpdateFightDTO, calculatePointsFn: (pick: any) => number): Promise<void> {
        await prisma.$transaction(async (tx) => {
            console.log(`[SCORING] Iniciando recálculo para Luta ${fightId}`);

            // 0. Update Fight Result (Atomic)
            const updateData: any = {
                // Scalar Fields
                ...(fightData.category && { category: fightData.category }),
                ...(fightData.weight_class && { weight_class: fightData.weight_class }),
                ...(fightData.rounds && { rounds: Number(fightData.rounds) }),
                // REMOVING STATUS FIELD - Replacing with lock_status: CLOSED for completed fights
                lock_status: 'CLOSED',

                ...(fightData.order !== undefined && { order: Number(fightData.order) }),
                ...(fightData.video_url !== undefined && { video_url: fightData.video_url }),
                ...(fightData.is_title !== undefined && { is_title: Boolean(fightData.is_title) }),

                // Betting / Admin
                ...(fightData.points !== undefined && { points: Number(fightData.points) }),
                custom_lock_time: (fightData.custom_lock_time && fightData.custom_lock_time !== "")
                    ? new Date(fightData.custom_lock_time)
                    : null,

                // Results (Scalars) - Enforcing Uppercase Enum
                ...(fightData.method !== undefined && { method: fightData.method }),
                ...(fightData.result !== undefined && { result: (fightData.result as string).toUpperCase() as 'WIN' | 'DRAW' | 'NC' }),
                ...(fightData.round_end !== undefined && {
                    round_end: fightData.round_end ? String(fightData.round_end) : null
                }),
                ...(fightData.time !== undefined && { time: fightData.time }),

                // RELATIONS
                // If we have a winner_id, connect it. explicit null means disconnect (Draw/NC)
                ...(fightData.winner_id
                    ? { winner: { connect: { id: fightData.winner_id } } }
                    : { winner: { disconnect: true } }
                ),
            };

            await tx.fight.update({
                where: { id: fightId },
                data: updateData
            });

            // 1. Lock Event
            const fight = await tx.fight.findUnique({ where: { id: fightId } });
            if (!fight) throw new Error("Fight not found");
            await tx.event.update({ where: { id: fight.event_id }, data: { is_calculating_points: true } });

            // 2. Rollback (Clean old points)
            const picks = await tx.pick.findMany({ where: { fight_id: fightId } });
            for (const pick of picks) {
                if (pick.points_earned > 0) {
                    await tx.user.update({
                        where: { id: pick.user_id },
                        data: {
                            points: { decrement: pick.points_earned },
                            monthly_points: { decrement: pick.points_earned },
                            yearly_points: { decrement: pick.points_earned }
                        }
                    });
                }
            }

            // 3. Calculate & Apply New Points
            const picksToUpdate: { id: string; userId: string; points: number }[] = [];
            for (const pick of picks) {
                const newPoints = calculatePointsFn(pick); // Recalcula com o resultado atual
                if (newPoints > 0) {
                    picksToUpdate.push({ id: pick.id, userId: pick.user_id, points: newPoints });
                } else {
                    // Se zerou, atualiza o pick para 0
                    await tx.pick.update({ where: { id: pick.id }, data: { points_earned: 0 } });
                }
            }

            // 4. Batch Updates (Optimization)
            const userIncrements: Record<string, number> = {};
            for (const p of picksToUpdate) {
                await tx.pick.update({ where: { id: p.id }, data: { points_earned: p.points } });
                if (!userIncrements[p.userId]) userIncrements[p.userId] = 0;
                userIncrements[p.userId] += p.points;
            }

            for (const userId of Object.keys(userIncrements)) {
                const points = userIncrements[userId];
                await tx.user.update({
                    where: { id: userId },
                    data: {
                        points: { increment: points },
                        monthly_points: { increment: points },
                        yearly_points: { increment: points }
                    }
                });
            }

            // 5. Unlock Event
            await tx.event.update({ where: { id: fight.event_id }, data: { is_calculating_points: false } });
            console.log(`[SCORING] Recálculo finalizado com sucesso.`);
        }, { timeout: 30000 });
    }
}
