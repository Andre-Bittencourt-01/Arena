import { Fight, Event } from "@prisma/client";

export interface CreateFightDTO {
    eventId: string;
    fighterAId: string;
    fighterBId: string;
    rounds: number;
    isTitle: boolean;
    category: string;
}

export interface IFightRepository {
    findByIdWithEvent(id: string): Promise<(Fight & { event: Event }) | null>;
    update(id: string, data: Partial<Fight>): Promise<void>;
    create(data: CreateFightDTO): Promise<void>;
    findByEventId(eventId: string): Promise<any[]>;
}
