import { Fight, Event } from "@prisma/client";

export interface IFightRepository {
    findByIdWithEvent(id: string): Promise<(Fight & { event: Event }) | null>;
    update(id: string, data: Partial<Fight>): Promise<void>;
}
