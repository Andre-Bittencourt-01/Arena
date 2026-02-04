import { Event, Fight } from "@prisma/client";

export interface IEventRepository {
    findUpcoming(): Promise<(Event & { fights: Fight[] })[]>;
    findById(id: string): Promise<Event | null>;
    create(data: Omit<Event, 'id' | 'status' | 'lock_status'>): Promise<Event>;
    update(id: string, data: Partial<Event>): Promise<Event>;
    delete(id: string): Promise<void>;
    findAll(): Promise<any[]>;
}
