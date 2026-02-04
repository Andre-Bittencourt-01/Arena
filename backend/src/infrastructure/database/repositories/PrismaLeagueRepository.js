import { prisma } from '../client.js';
export class PrismaLeagueRepository {
    async create(data) {
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
    async findById(id) {
        return await prisma.league.findUnique({
            where: { id }
        });
    }
    async findByInviteCode(code) {
        return await prisma.league.findUnique({
            where: { invite_code: code }
        });
    }
    async addMember(leagueId, userId, role = "MEMBER") {
        return await prisma.leagueMember.create({
            data: {
                league_id: leagueId,
                user_id: userId,
                role: role
            }
        });
    }
    async findMembersWithPoints(leagueId) {
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
        });
    }
    async findByUserId(userId) {
        const memberships = await prisma.leagueMember.findMany({
            where: { user_id: userId },
            include: {
                league: true
            }
        });
        return memberships.map(m => m.league);
    }
    async findAll() {
        return await prisma.league.findMany({
            include: {
                _count: {
                    select: { members: true }
                }
            }
        });
    }
}
//# sourceMappingURL=PrismaLeagueRepository.js.map