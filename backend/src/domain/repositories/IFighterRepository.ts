import { Fighter } from "@prisma/client";

export interface IFighterRepository {
    create(data: Omit<Fighter, 'id' | 'wins' | 'losses' | 'draws' | 'nc'>): Promise<Fighter>;
    findById(id: string): Promise<Fighter | null>;
    findAll(): Promise<Fighter[]>;
}
