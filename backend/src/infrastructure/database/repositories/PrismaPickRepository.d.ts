import { Pick } from "@prisma/client";
import { IPickRepository, SavePickDTO } from '../../../domain/repositories/IPickRepository.js';
export declare class PrismaPickRepository implements IPickRepository {
    save(data: SavePickDTO): Promise<Pick>;
    findByUserAndEvent(userId: string, eventId: string): Promise<Pick[]>;
    findByEvent(eventId: string): Promise<Pick[]>;
    updatePoints(pickId: string, points: number): Promise<void>;
}
