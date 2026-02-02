import { Fight, Event } from "@prisma/client";
import { IFightRepository } from '../../../domain/repositories/IFightRepository.js';
export declare class PrismaFightRepository implements IFightRepository {
    findByIdWithEvent(id: string): Promise<(Fight & {
        event: Event;
    }) | null>;
    update(id: string, data: Partial<Fight>): Promise<void>;
}
