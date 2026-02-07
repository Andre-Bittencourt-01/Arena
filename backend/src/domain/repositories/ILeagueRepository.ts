import { League } from '../entities/League.js';
import { LeagueMember, LeagueRole } from "@prisma/client";

export interface CreateLeagueDTO {
    name: string;
    description?: string;
    inviteCode: string;
    ownerId: string;
}

export interface ILeagueRepository {
    create(data: CreateLeagueDTO): Promise<League>;
    findById(id: string): Promise<(League & { members: (LeagueMember & { user: { name: string, points: number, avatar_url: string | null } })[] }) | null>;
    findByInviteCode(code: string): Promise<League | null>;
    addMember(leagueId: string, userId: string, role?: LeagueRole): Promise<LeagueMember>;
    findMembersWithPoints(leagueId: string, filters?: { eventId?: string, month?: string, year?: string }): Promise<(LeagueMember & { user: { name: string, points: number, avatar_url: string | null } })[]>;
    findByUserId(userId: string): Promise<(League & { members: LeagueMember[] })[]>;
    update(id: string, data: Partial<CreateLeagueDTO>): Promise<League>;
    findAll(): Promise<(League & { members: LeagueMember[] })[]>;
}
