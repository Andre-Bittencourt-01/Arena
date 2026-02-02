import { Pick } from "@prisma/client";

export interface SavePickDTO {
    userId: string;
    fightId: string;
    eventId: string;
    fighterId: string;
    method: string;
    round: string;
}

export interface IPickRepository {
    save(data: SavePickDTO): Promise<Pick>;
    findByUserAndEvent(userId: string, eventId: string): Promise<Pick[]>;
    findByEvent(eventId: string): Promise<Pick[]>;
    updatePoints(pickId: string, points: number): Promise<void>;
}
