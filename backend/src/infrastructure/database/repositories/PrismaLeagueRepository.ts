import { League, LeagueMember, LeagueRole } from "@prisma/client";
import { CreateLeagueDTO, ILeagueRepository } from '../../../domain/repositories/ILeagueRepository.js';
import { prisma } from '../client.js';

export class PrismaLeagueRepository implements ILeagueRepository {
    async create(data: CreateLeagueDTO): Promise<League> {
        return await prisma.league.create({
            data: {
                name: data.name,
                description: data.description,
                invite_code: data.inviteCode,
                owner_id: data.ownerId,
                members: {
                    create: {
                        user_id: data.ownerId,
                        role: "OWNER"
                    }
                }
            }
        });
    }

    async findById(id: string): Promise<(League & { members: (LeagueMember & { user: { name: string, points: number, avatar_url: string | null } })[] }) | null> {
        return await prisma.league.findUnique({
            where: { id },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                points: true,
                                avatar_url: true
                            }
                        }
                    }
                }
            }
        }) as any;
    }

    async findByInviteCode(code: string): Promise<League | null> {
        return await prisma.league.findUnique({
            where: { invite_code: code }
        });
    }

    async addMember(leagueId: string, userId: string, role: LeagueRole = "MEMBER"): Promise<LeagueMember> {
        return await prisma.leagueMember.create({
            data: {
                league_id: leagueId,
                user_id: userId,
                role: role
            }
        });
    }

    async findMembersWithPoints(leagueId: string): Promise<(LeagueMember & { user: { name: string, points: number, avatar_url: string | null } })[]> {
        return await prisma.leagueMember.findMany({
            where: { league_id: leagueId },
            include: {
                user: {
                    select: {
                        name: true,
                        points: true,
                        avatar_url: true
                    }
                }
            },
            orderBy: {
                user: {
                    points: 'desc'
                }
            }
        }) as any;
    }

    async findByUserId(userId: string): Promise<(League & { members: LeagueMember[] })[]> {
        const memberships = await prisma.leagueMember.findMany({
            where: { user_id: userId },
            include: {
                league: {
                    include: { members: true }
                }
            }
        });
        return memberships.map(m => m.league);
    }

    async update(id: string, data: Partial<CreateLeagueDTO>): Promise<League> {
        return await prisma.league.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                logo_url: (data as any).logo_url || (data as any).logo // Handle potential logo/logo_url naming
            }
        });
    }

    async findAll(): Promise<(League & { members: LeagueMember[] })[]> {
        return await prisma.league.findMany({
            include: {
                members: true
            }
        });
    }
}


