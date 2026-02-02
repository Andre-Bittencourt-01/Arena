import { Pick, Fight } from "@prisma/client";
export declare class ScoringService {
    /**
     * Calculates points for a single pick based on the official fight result.
     * Logic:
     * - Correct winner: +100 points
     * - (Future) Correct method: +50 points
     * - (Future) Correct round: +50 points
     */
    calculatePoints(pick: Pick, fight: Fight): number;
}
