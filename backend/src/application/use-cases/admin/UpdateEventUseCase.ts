import { Event, EventStatus, LockStatus } from "@prisma/client";
import { IEventRepository } from "../../../domain/repositories/IEventRepository.js";

interface UpdateEventRequest {
    id: string;
    title?: string;
    subtitle?: string;
    date?: string | Date;
    location?: string;
    banner_url?: string;
    status?: EventStatus;
    lock_status?: LockStatus;
}

export class UpdateEventUseCase {
    constructor(private eventRepository: IEventRepository) { }

    async execute(data: UpdateEventRequest): Promise<Event> {
        const existingEvent = await this.eventRepository.findById(data.id);

        if (!existingEvent) {
            throw new Error("Event not found");
        }

        const { id, date, ...rest } = data;
        const updateData: Partial<Event> = { ...rest };

        if (date) {
            updateData.date = typeof date === 'string' ? new Date(date) : date;
        }

        return await this.eventRepository.update(id, updateData);
    }
}
