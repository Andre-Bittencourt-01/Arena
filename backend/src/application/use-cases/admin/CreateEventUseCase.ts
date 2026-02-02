import { Event, EventStatus, LockStatus } from "@prisma/client";
import { IEventRepository } from "../../../domain/repositories/IEventRepository.js";

interface CreateEventRequest {
    title: string;
    subtitle?: string;
    date: string | Date;
    end_date?: string | Date;
    location?: string;
    banner_url?: string;
    status?: EventStatus;
    lock_status?: LockStatus;
    lock_time?: string | Date;
    cascade_start_time?: string | Date;
    banner_settings?: any;
}

export class CreateEventUseCase {
    constructor(private eventRepository: IEventRepository) { }

    async execute(data: CreateEventRequest): Promise<Event> {
        console.log("🛠️ [DEBUG AUTH] Executando CreateEventUseCase...");

        const eventDate = typeof data.date === 'string' ? new Date(data.date) : data.date;
        const endDate = data.end_date ? (typeof data.end_date === 'string' ? new Date(data.end_date) : data.end_date) : null;
        const lockTime = data.lock_time ? (typeof data.lock_time === 'string' ? new Date(data.lock_time) : data.lock_time) : null;
        const cascadeStartTime = data.cascade_start_time ? (typeof data.cascade_start_time === 'string' ? new Date(data.cascade_start_time) : data.cascade_start_time) : null;

        return await this.eventRepository.create({
            title: data.title,
            subtitle: data.subtitle || null,
            date: eventDate,
            location: data.location || null,
            banner_url: data.banner_url || null,
            end_date: endDate as any,
            lock_time: lockTime as any,
            cascade_start_time: cascadeStartTime as any,
            banner_settings: data.banner_settings || null,
            status: data.status || 'SCHEDULED',
            lock_status: data.lock_status || 'OPEN'
        } as any);
    }
}
