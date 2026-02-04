import { Event, Fight, EventStatus, LockStatus } from "@prisma/client";
import { IEventRepository } from '../../../domain/repositories/IEventRepository.js';
import { prisma } from '../client.js';

export class PrismaEventRepository implements IEventRepository {
    async findUpcoming(): Promise<(Event & { fights: Fight[] })[]> {
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

    async findAll(): Promise<any[]> {
        return await prisma.event.findMany({
            include: {
                _count: {
                    select: { fights: true }
                }
            },
            orderBy: {
                date: 'desc'
            }
        });
    }

    async findById(id: string): Promise<Event | null> {
        return await prisma.event.findUnique({
            where: { id }
        });
    }

    async create(data: Omit<Event, 'id'>): Promise<Event> {
        // Generate ID from title (slug)
        const id = 'evt_' + data.title.toLowerCase().replace(/\s+/g, '_');

        // Map status and lock_status to Enums
        const statusMap: Record<string, EventStatus> = {
            'upcoming': 'SCHEDULED',
            'live': 'LIVE',
            'completed': 'COMPLETED'
        };

        const lockMap: Record<string, LockStatus> = {
            'open': 'OPEN',
            'closed': 'CLOSED'
        };

        const mappedData = {
            ...data,
            status: statusMap[data.status] || 'SCHEDULED',
            lock_status: lockMap[data.lock_status] || 'OPEN'
        };

        return await prisma.event.create({
            data: {
                id,
                ...mappedData
            } as any
        });
    }

    async update(id: string, data: Partial<Event>): Promise<Event> {
        const statusMap: Record<string, EventStatus> = {
            'upcoming': 'SCHEDULED',
            'live': 'LIVE',
            'completed': 'COMPLETED'
        };

        const lockMap: Record<string, LockStatus> = {
            'open': 'OPEN',
            'closed': 'CLOSED'
        };

        const mappedData: any = { ...data };
        if (data.status) mappedData.status = statusMap[data.status] || data.status;
        if (data.lock_status) mappedData.lock_status = lockMap[data.lock_status] || data.lock_status;

        return await prisma.event.update({
            where: { id },
            data: mappedData
        });
    }

    async delete(id: string): Promise<void> {
        await prisma.event.delete({
            where: { id }
        });
    }
}
