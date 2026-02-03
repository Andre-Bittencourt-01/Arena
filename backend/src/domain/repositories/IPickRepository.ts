import { Pick } from "@prisma/client";

export interface SavePickDTO {
    user_id: string;
    fight_id: string;
    event_id: string;
    fighter_id: string;
    method: string;
    round: string;
}

export interface IPickRepository {
    save(data: SavePickDTO): Promise<Pick>;
    saveBatch(data: SavePickDTO[]): Promise<void>;
    findByUserAndEvent(userId: string, eventId: string): Promise<Pick[]>;
    findByEvent(eventId: string): Promise<Pick[]>;
    updatePoints(pickId: string, points: number): Promise<void>;
}
