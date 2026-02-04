import { Fight, Event } from "@prisma/client";

export interface CreateFightDTO {
    event_id: string;
    fighter_a_id: string;
    fighter_b_id: string;
    rounds: number;
    is_title: boolean;
    category: string;
}

export interface UpdateFightDTO {
    event_id?: string;
    fighter_a_id?: string;
    fighter_b_id?: string;
    category?: string;
    weight_class?: string;
    rounds?: number;
    status?: string;
    order?: number;
    video_url?: string;
    is_title?: boolean;
    winner_id?: string | null;
    method?: string | null;
    round_end?: string | null; // Changed to string to match DB
    time?: string | null;      // Changed to time to match DB
    points?: number;
    lock_status?: string;
    custom_lock_time?: string | Date; // Allow Date
    result?: string | null;
}

export interface IFightRepository {
    findByIdWithEvent(id: string): Promise<(Fight & { event: Event }) | null>;
    update(id: string, data: UpdateFightDTO): Promise<Fight>;
    create(data: CreateFightDTO): Promise<Fight>;
    findByEventId(eventId: string): Promise<any[]>;
}
