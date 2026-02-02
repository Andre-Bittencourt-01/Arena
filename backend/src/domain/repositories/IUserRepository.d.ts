import { User } from "@prisma/client";
export interface IUserRepository {
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    incrementPoints(userId: string, points: number): Promise<void>;
    update(userId: string, data: Partial<User>): Promise<void>;
}
