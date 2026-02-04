import { Event, Fight } from "@prisma/client";
import { IEventRepository } from '../../../domain/repositories/IEventRepository.js';
export declare class PrismaEventRepository implements IEventRepository {
    findUpcoming(): Promise<(Event & {
        fights: Fight[];
    })[]>;
    findById(id: string): Promise<Event | null>;
}
