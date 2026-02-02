import { IUserRepository } from '../../../domain/repositories/IUserRepository.js';
import { User } from "@prisma/client";
export declare class PrismaUserRepository implements IUserRepository {
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    incrementPoints(userId: string, points: number): Promise<void>;
    update(userId: string, data: Partial<User>): Promise<void>;
}
