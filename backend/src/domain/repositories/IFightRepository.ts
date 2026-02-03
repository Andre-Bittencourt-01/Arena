import { Fight, Event } from "@prisma/client";

export interface CreateFightDTO {
    event_id: string;
    fighter_a_id: string;
    fighter_b_id: string;
    rounds: number;
    is_title: boolean;
    category: string;
}

export interface IFightRepository {
    findByIdWithEvent(id: string): Promise<(Fight & { event: Event }) | null>;
    update(id: string, data: Partial<Fight>): Promise<void>;
    create(data: CreateFightDTO): Promise<void>;
    findByEventId(eventId: string): Promise<any[]>;
}
