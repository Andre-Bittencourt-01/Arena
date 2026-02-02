import { League, LeagueMember, LeagueRole } from "@prisma/client";
import { CreateLeagueDTO, ILeagueRepository } from '../../../domain/repositories/ILeagueRepository.js';
export declare class PrismaLeagueRepository implements ILeagueRepository {
    create(data: CreateLeagueDTO): Promise<League>;
    findById(id: string): Promise<League | null>;
    findByInviteCode(code: string): Promise<League | null>;
    addMember(leagueId: string, userId: string, role?: LeagueRole): Promise<LeagueMember>;
    findMembersWithPoints(leagueId: string): Promise<(LeagueMember & {
        user: {
            name: string;
            points: number;
            avatar_url: string | null;
        };
    })[]>;
    findByUserId(userId: string): Promise<League[]>;
    findAll(): Promise<(League & {
        _count?: {
            members: number;
        };
    })[]>;
}
