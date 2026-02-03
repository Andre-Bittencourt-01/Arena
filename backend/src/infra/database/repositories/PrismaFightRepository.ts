import { Fight, Event } from "@prisma/client";
import { IFightRepository, CreateFightDTO } from '../../../domain/repositories/IFightRepository.js';
import { prisma } from '../client.js';
import { randomUUID } from 'node:crypto';

export class PrismaFightRepository implements IFightRepository {
    async findByIdWithEvent(id: string): Promise<(Fight & { event: Event }) | null> {
        return await prisma.fight.findUnique({
            where: { id },
            include: { event: true }
        });
    }

    async update(id: string, data: Partial<Fight>): Promise<void> {
        console.log('[DEBUG REPO] Dados finais para o Prisma:', {
            id,
            winnerId: data.winner_id,
            roundEnd: data.round_end,
            result: data.result
        });

        // Construct payload using 'connect' for relations to satisfy Prisma Client validation
        const payload: any = {
            rounds: data.rounds,
            is_title: data.is_title,
            category: data.category,
            // Ensure Enums are UPPERCASE
            result: data.result ? (data.result as string).toUpperCase() : null,
            method: data.method,
            round_end: data.round_end,
            time: data.time,

            // 'status' column verification - mapped to lock_status if available
            lock_status: (data as any).lockStatus || (data as any).lock_status || undefined
        };

        // Relations - Use connect syntax
        // UseCase sends snake_case keys: event_id, fighter_a_id, fighter_b_id
        if (data.event_id) {
            payload.event = { connect: { id: data.event_id } };
        }
        if (data.fighter_a_id) {
            payload.fighter_a = { connect: { id: data.fighter_a_id } };
        }
        if (data.fighter_b_id) {
            payload.fighter_b = { connect: { id: data.fighter_b_id } };
        }

        // Winner (Optional)
        // If winner_id is explicit null, disconnect. If value, connect.
        if (data.winner_id) {
            payload.winner = { connect: { id: data.winner_id } };
        } else if (data.winner_id === null) {
            payload.winner = { disconnect: true };
        }

        await prisma.fight.update({
            where: { id },
            data: payload
        });
    }

    async create(data: CreateFightDTO): Promise<void> {
        await prisma.fight.create({
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
    }
    async findByEventId(eventId: string): Promise<any[]> {
        const fights = await prisma.fight.findMany({
            where: { event_id: eventId },
            include: {
                fighter_a: true,
                fighter_b: true,
                winner: true
            },
            orderBy: { id: 'asc' }
        });

        return fights.map(f => ({
            id: f.id,
            event_id: f.event_id,
            fighter_a_id: f.fighter_a_id,
            fighter_b_id: f.fighter_b_id,
            rounds: f.rounds,
            is_title: f.is_title,
            category: f.category,
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
            status: f.result ? 'COMPLETED' : 'SCHEDULED', // Campo Derivado
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
            }
        }));
    }
}
