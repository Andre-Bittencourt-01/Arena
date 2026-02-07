import { FastifyRequest, FastifyReply } from "fastify";
import { RankingSnapshotService } from "../../domain/services/RankingSnapshotService.js";

const snapshotService = new RankingSnapshotService();

interface SnapshotBody {
    leagueId?: string; // Optional, defaults to 'global-league'
    period: string;    // '2026-02', '2026', 'evt_ufc325'
    type: 'MONTH' | 'YEAR' | 'EVENT';
}

export class AdminController {
    async createSnapshot(request: FastifyRequest<{ Body: SnapshotBody }>, reply: FastifyReply) {
        try {
            const { leagueId = 'global-league', period, type } = request.body;

            // Basic Validation
            if (!period || !type) {
                return reply.status(400).send({ error: "Missing 'period' or 'type'." });
            }

            console.log(`[ADMIN] Triggering Snapshot: ${type} - ${period}`);

            const count = await snapshotService.captureSnapshot(leagueId, period, type);

            return reply.status(200).send({
                success: true,
                message: `Snapshot created successfully. Frozen ${count} rankings.`,
                timestamp: new Date().toISOString()
            });

        } catch (error: any) {
            console.error("[ADMIN] Snapshot Error:", error);
            return reply.status(500).send({ error: "Failed to create snapshot." });
        }
    }
}
