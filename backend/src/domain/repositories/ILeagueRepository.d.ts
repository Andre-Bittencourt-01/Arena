import { League, LeagueMember, LeagueRole } from "@prisma/client";
export interface CreateLeagueDTO {
    name: string;
    description?: string;
    inviteCode: string;
    ownerId: string;
}
export interface ILeagueRepository {
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
