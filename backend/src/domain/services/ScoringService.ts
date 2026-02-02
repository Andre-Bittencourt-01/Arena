import { Pick, Fight } from "@prisma/client";

export class ScoringService {
    /**
     * Calculates points for a single pick based on the official fight result.
     * Logic:
     * - Correct winner: +100 points
     * - (Future) Correct method: +50 points
     * - (Future) Correct round: +50 points
     */
    calculatePoints(pick: Pick, fight: Fight): number {
        let totalPoints = 0;

        // Ensure fight has a winner and results
        if (!fight.winner_id) return 0;

        // 1. Correct Winner Check
        if (pick.fighter_id === fight.winner_id) {
            totalPoints += 100;
        }

        // Placeholder for advanced scoring (method/round)
        // if (pick.method === fight.method) totalPoints += 50;
        // if (pick.round === fight.round_end) totalPoints += 50;

        return totalPoints;
    }
}
