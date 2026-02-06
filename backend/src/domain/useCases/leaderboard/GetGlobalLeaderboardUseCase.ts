import { prisma } from '../../../infrastructure/database/client.js';

export interface LeaderboardEntry {
    position: number;
    userId: string;
    name: string;
    avatar_url: string | null;
    points: number;
    trend: number; // 0 for now
}

interface Request {
    period: 'week' | 'month' | 'year' | 'all';
    eventId?: string; // Required if period === 'week'
    limit?: number;
}

export class GetGlobalLeaderboardUseCase {
    async execute({ period, eventId, limit = 100 }: Request): Promise<LeaderboardEntry[]> {

        let usersData: { id: string; name: string; avatar_url: string | null; points: number }[] = [];

        if (period === 'week' && eventId) {
            // Ranking by specific Event (Week)
            // We need to sum points from Picks for this event
            const picks = await prisma.pick.groupBy({
                by: ['user_id'],
                where: {
                    fight: {
                        event_id: eventId
                    }
                },
                _sum: {
                    points_earned: true
                },
                orderBy: {
                    _sum: {
                        points_earned: 'desc'
                    }
                },
                take: limit
            });

            // Need to fetch user details for these IDs
            const userIds = picks.map(p => p.user_id);
            const users = await prisma.user.findMany({
                where: { id: { in: userIds } },
                select: { id: true, name: true, avatar_url: true }
            });

            // Map back to result
            usersData = picks.map(p => {
                const user = users.find(u => u.id === p.user_id);
                return {
                    id: p.user_id,
                    name: user?.name || 'Unknown',
                    avatar_url: user?.avatar_url || null,
                    points: p._sum.points_earned || 0
                };
            });

        } else if (period === 'month') {
            // Ranking by Month (using User.monthly_points)
            // Note: Ideally we should filter by date if we have history, but given schema, we use the current monthly_points field
            const users = await prisma.user.findMany({
                orderBy: { monthly_points: 'desc' },
                take: limit,
                select: { id: true, name: true, avatar_url: true, monthly_points: true }
            });
            usersData = users.map(u => ({ ...u, points: u.monthly_points }));

        } else if (period === 'year') {
            const users = await prisma.user.findMany({
                orderBy: { yearly_points: 'desc' },
                take: limit,
                select: { id: true, name: true, avatar_url: true, yearly_points: true }
            });
            usersData = users.map(u => ({ ...u, points: u.yearly_points }));

        } else {
            // All Time
            const users = await prisma.user.findMany({
                orderBy: { points: 'desc' },
                take: limit,
                select: { id: true, name: true, avatar_url: true, points: true }
            });
            usersData = users.map(u => ({ ...u, points: u.points }));
        }

        // Add position
        return usersData.map((entry, index) => ({
            position: index + 1,
            userId: entry.id,
            name: entry.name,
            avatar_url: entry.avatar_url,
            points: entry.points,
            trend: 0
        }));
    }
}
