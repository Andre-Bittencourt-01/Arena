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

        // Map DTO to Prisma Schema
        // We explicitly map fields to ensure undefined ones don't overwrite existing data with nulls (unless intended)
        const updateData: any = {
            // Administrative Details
            ...(data.event_id && { event_id: data.event_id }),
            ...(data.fighter_a_id && { fighter_a_id: data.fighter_a_id }),
            ...(data.fighter_b_id && { fighter_b_id: data.fighter_b_id }),
            ...(data.category && { category: data.category }),
            ...(data.weight_class && { weight_class: data.weight_class }),
            ...(data.rounds && { rounds: Number(data.rounds) }), // Ensure number
            ...(data.status && { status: data.status }),
            ...(data.order !== undefined && { order: Number(data.order) }),
            ...(data.video_url !== undefined && { video_url: data.video_url }),
            ...(data.is_title !== undefined && { is_title: Boolean(data.is_title) }),

            // Results & Outcome
            ...(data.winner_id !== undefined && { winner_id: data.winner_id }), // can be null
            ...(data.method !== undefined && { method: data.method }),
            ...(data.round_end !== undefined && { round_end: data.round_end }),
            ...(data.time !== undefined && { time: data.time }), // Changed to data.time

            // Betting Logic
            ...(data.points !== undefined && { points: Number(data.points) }),
            ...(data.lock_status && { lock_status: data.lock_status }),
            ...(data.custom_lock_time !== undefined && { custom_lock_time: data.custom_lock_time }),

            // Legacy Result (ensure Uppercase if provided)
            ...(data.result && { result: data.result.toUpperCase() }),
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
            orderBy: { id: 'asc' }
        });

        // This mapping logic seems to be creating a custom view model. 
        // We should ensure it maps correctly, but for now we are just fixing the update logic errors.
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
