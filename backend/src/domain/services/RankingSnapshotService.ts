import { PrismaClient } from '@prisma/client';
import { PrismaLeagueRepository } from '../../infrastructure/database/repositories/PrismaLeagueRepository.js';

const prisma = new PrismaClient();

export class RankingSnapshotService {
    private leagueRepository: PrismaLeagueRepository;

    constructor() {
        this.leagueRepository = new PrismaLeagueRepository();
    }

    /**
     * Consolidates rankings after an event.
     * Calculates deltas relative to the PREVIOUS event to show progress within the Month and Year.
     */
    async captureSnapshot(leagueId: string, period: string, type: 'MONTH' | 'YEAR' | 'EVENT') {
        console.log(`[SNAPSHOT] Processing ${type} ${period}...`);

        // We focus on 'EVENT' as the main trigger for "Closing a Card"
        if (type === 'EVENT') {
            return this.consolidateEvent(leagueId, period);
        }

        // Fallback for manual Month/Year snapshots (if ever needed separately)
        // For now, we assume the Admin uses the "Close Event" button primarily.
        console.log('[SNAPSHOT] Manual Month/Year snapshot not fully implemented in this version. Use EVENT consolidation.');
        return 0;
    }

    private async consolidateEvent(leagueId: string, eventId: string) {
        const currentEvent = await prisma.event.findUnique({ where: { id: eventId } });
        if (!currentEvent) throw new Error(`Event ${eventId} not found.`);

        const eventDate = new Date(currentEvent.date);
        const currentYear = eventDate.getUTCFullYear().toString();
        const currentMonth = `${currentYear}-${String(eventDate.getUTCMonth() + 1).padStart(2, '0')}`;

        console.log(`[SNAPSHOT] Consolidating Event: ${currentEvent.title} (${currentMonth})`);

        // --- 1. IDENTIFY PREDECESSORS (Baseline) ---

        // A. Global Predecessor (For Yearly Delta) - Any completed event before this one
        const prevGlobalEvent = await prisma.event.findFirst({
            where: {
                date: { lt: currentEvent.date },
                status: { in: ['COMPLETED', 'FINISHED'] }
            },
            orderBy: { date: 'desc' }
        });

        // B. Monthly Predecessor (For Monthly Delta) - Completed event in SAME Month before this one
        // We filter events that start with the same YYYY-MM
        // Note: Prisma string filtering on dates can be tricky, so we use date ranges or fetch & filter.
        // Simple approach: Date range for the month.
        const startOfMonth = new Date(Date.UTC(eventDate.getUTCFullYear(), eventDate.getUTCMonth(), 1));
        const prevMonthlyEvent = await prisma.event.findFirst({
            where: {
                date: {
                    lt: currentEvent.date,
                    gte: startOfMonth
                },
                status: { in: ['COMPLETED', 'FINISHED'] }
            },
            orderBy: { date: 'desc' }
        });

        // --- 2. FETCH SNAPSHOT BASELINES ---

        const prevYearlyMap = new Map<string, number>();
        if (prevGlobalEvent) {
            console.log(`[SNAPSHOT] Yearly Baseline: ${prevGlobalEvent.title}`);
            const snaps = await prisma.rankingSnapshot.findMany({
                where: { league_id: leagueId, period: prevGlobalEvent.id, type: 'YEARLY_AT_EVENT' },
                select: { user_id: true, rank: true }
            });
            snaps.forEach(s => prevYearlyMap.set(s.user_id, s.rank));
        } else {
            console.log(`[SNAPSHOT] No Yearly Baseline (First event of year/history).`);
        }

        const prevMonthlyMap = new Map<string, number>();
        if (prevMonthlyEvent) {
            console.log(`[SNAPSHOT] Monthly Baseline: ${prevMonthlyEvent.title}`);
            const snaps = await prisma.rankingSnapshot.findMany({
                where: { league_id: leagueId, period: prevMonthlyEvent.id, type: 'MONTHLY_AT_EVENT' },
                select: { user_id: true, rank: true }
            });
            snaps.forEach(s => prevMonthlyMap.set(s.user_id, s.rank));
        } else {
            console.log(`[SNAPSHOT] No Monthly Baseline (First event of month).`);
        }

        // --- 3. CALCULATE LIVE STANDINGS ---

        // A. Yearly Standings (Sum of all picks in Year)
        const liveYearly = await this.leagueRepository.findMembersWithPoints(leagueId, { year: currentYear });

        // B. Monthly Standings (Sum of all picks in Month)
        const liveMonthly = await this.leagueRepository.findMembersWithPoints(leagueId, { month: currentMonth });

        // --- 4. PREPARE DATA ---

        const newSnapshots: any[] = [];
        const userUpdates: any[] = [];
        const processedUsers = new Set<string>();

        // Process Yearly Data
        liveYearly.forEach((entry, index) => {
            const rank = index + 1;
            const prevRank = prevYearlyMap.get(entry.user_id);
            const delta = prevRank ? (prevRank - rank) : 0; // + means Improved (went from 10 to 5)

            newSnapshots.push({
                user_id: entry.user_id,
                league_id: leagueId,
                period: eventId,
                type: 'YEARLY_AT_EVENT',
                rank: rank,
                points: entry.user.points // Yearly points
            });

            // Queue User Update (Yearly Delta)
            userUpdates.push(prisma.user.update({
                where: { id: entry.user_id },
                data: { yearly_rank_delta: delta }
            }));
            processedUsers.add(entry.user_id);
        });

        // Process Monthly Data
        liveMonthly.forEach((entry, index) => {
            const rank = index + 1;
            const prevRank = prevMonthlyMap.get(entry.user_id);
            const delta = prevRank ? (prevRank - rank) : 0;

            newSnapshots.push({
                user_id: entry.user_id,
                league_id: leagueId,
                period: eventId,
                type: 'MONTHLY_AT_EVENT',
                rank: rank,
                points: entry.user.points // Monthly points
            });

            // Queue User Update (Monthly Delta)
            userUpdates.push(prisma.user.update({
                where: { id: entry.user_id },
                data: { monthly_rank_delta: delta }
            }));
        });

        // --- 5. ATOMIC COMMIT ---

        // Clean up old snapshots for THIS event if they exist (Correction/Re-run scenario)
        const deleteOld = prisma.rankingSnapshot.deleteMany({
            where: {
                league_id: leagueId,
                period: eventId,
                type: { in: ['YEARLY_AT_EVENT', 'MONTHLY_AT_EVENT'] }
            }
        });

        await prisma.$transaction([
            deleteOld,
            prisma.rankingSnapshot.createMany({ data: newSnapshots }),
            ...userUpdates
        ]);

        console.log(`[SNAPSHOT] Consolidation Complete. ${newSnapshots.length} snapshot records. Deltas updated.`);
        return newSnapshots.length;
    }
}
