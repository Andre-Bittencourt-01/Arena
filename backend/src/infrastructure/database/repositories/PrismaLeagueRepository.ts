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
        }) as any;
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
        }) as any;
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

    async findMembersWithPoints(
        leagueId: string,
        filters: { eventId?: string, month?: string, year?: string } = {}
    ): Promise<(LeagueMember & { user: { name: string, points: number, avatar_url: string | null, monthly_rank_delta: number, yearly_rank_delta: number } })[]> {

        // 1. Fetch base members
        const members = await prisma.leagueMember.findMany({
            where: { league_id: leagueId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar_url: true,
                        monthly_rank_delta: true,
                        yearly_rank_delta: true
                    }
                }
            }
        });

        // 2. Calculate points dynamically (Robust: FindMany + Reduce)
        const membersWithCalculatedPoints = await Promise.all(members.map(async (member) => {
            let whereClause: any = { user_id: member.user_id };

            // Date Calculation Logic
            if (filters.eventId) {
                whereClause.event_id = filters.eventId;
            } else {
                let startTimestamp, endTimestamp;

                try {
                    // 1. Safe Parsing
                    const now = new Date();
                    let y = now.getFullYear();
                    let m = now.getMonth() + 1;

                    if (filters.month && filters.month.includes('-')) {
                        const parts = filters.month.split('-');
                        y = parseInt(parts[0]) || y;
                        m = parseInt(parts[1]) || m;
                        // Calculate Month Range
                        startTimestamp = Date.UTC(y, m - 1, 1);
                        endTimestamp = Date.UTC(y, m, 0, 23, 59, 59, 999);
                    } else if (filters.year) {
                        y = parseInt(filters.year) || y;
                        // Calculate Year Range
                        startTimestamp = Date.UTC(y, 0, 1);
                        endTimestamp = Date.UTC(y, 11, 31, 23, 59, 59, 999);
                    } else {
                        // Default Fallback
                        startTimestamp = Date.UTC(y, 0, 1);
                        endTimestamp = Date.UTC(y, 11, 31, 23, 59, 59, 999);
                    }
                } catch (e) {
                    console.error("Date Parsing Error", e);
                    // Absolute Fallback to prevent crash
                    const fallback = new Date();
                    startTimestamp = fallback.setHours(0, 0, 0, 0);
                    endTimestamp = fallback.setHours(23, 59, 59, 999);
                }

                // 2. Assign ONLY if Valid Number (Prevents 'Invalid Date')
                if (!Number.isNaN(startTimestamp) && !Number.isNaN(endTimestamp)) {
                    whereClause.event = {
                        date: { gte: new Date(startTimestamp as number), lte: new Date(endTimestamp as number) }
                    };
                }
            }

            // QUERY: Fetch raw picks to avoid aggregation bugs
            const picks = await prisma.pick.findMany({
                where: whereClause,
                select: { points_earned: true }
            });

            // SUM: Calculate in memory
            const totalPoints = picks.reduce((sum, p) => sum + (p.points_earned || 0), 0);

            return {
                ...member,
                user: {
                    ...member.user,
                    points: totalPoints,
                    avatar_url: member.user.avatar_url,
                    monthly_rank_delta: member.user.monthly_rank_delta,
                    yearly_rank_delta: member.user.yearly_rank_delta
                }
            };
        }));

        return membersWithCalculatedPoints.sort((a, b) => b.user.points - a.user.points);
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
        return memberships.map(m => m.league) as any;
    }

    async update(id: string, data: Partial<CreateLeagueDTO>): Promise<League> {
        return await prisma.league.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                logo_url: (data as any).logo_url || (data as any).logo // Handle potential logo/logo_url naming
            }
        }) as any;
    }

    async findAll(): Promise<(League & { members: LeagueMember[] })[]> {
        const leagues = await prisma.league.findMany({
            include: {
                members: true
            }
        });
        // DEBUG: Check if prisma is returning the field
        console.log("RECOPOSITORY DEBUG: League 'Arena MMA Global' is_system =", (leagues.find(l => l.name === 'Arena MMA Global' || l.name === 'ARENA MMA GLOBAL') as any)?.is_system);
        return leagues as any;
    }
}


