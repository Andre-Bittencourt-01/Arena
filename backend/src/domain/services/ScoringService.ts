import { Pick, Fight } from "@prisma/client";

export class ScoringService {
    /**
     * Calculates points for a single pick based on the official fight result.
     * Rules 2026:
     * - Base (Correct Winner): +30 pts
     * - Method (if winner correct): +20 pts
     * - Round/Type (if method correct): +10 pts
     * - Belt Bonus (Title Fight): +60 pts
     * - Main Event Bonus (Non-Title): +30 pts
     * - Mitada (Underdog <= 10% picks): +90 pts
     */
    calculatePoints(
        pick: Pick,
        fight: Fight,
        totalFightPicks: number = 0,
        winnerPickCount: number = 0
    ): number {
        // Nível 1: Winner (Base Check)
        if (!fight.winner_id || pick.fighter_id !== fight.winner_id) {
            return 0; // Fim da checagem para esta luta
        }

        let totalPoints = 30; // Level 1 Base

        // Bônus de Importância (Nível 1)
        if (fight.is_title) {
            totalPoints += 60;
        } else if (fight.category === 'Main Event') {
            totalPoints += 30;
        }

        // Bônus Mitada (Upset)
        // Apenas se passou pelo Nível 1
        if (totalFightPicks > 0) {
            const pickPercentage = (winnerPickCount / totalFightPicks) * 100;
            if (pickPercentage <= 10) {
                console.log(`[SCORING] Mitada detected for Fight ${fight.id}! Winner ${fight.winner_id} had ${pickPercentage.toFixed(1)}%`);
                totalPoints += 90;
            }
        }

        // Nível 2: Method
        // Se NÃO acertou, mantém apenas pontos do Nível 1 (e bônus).
        if (pick.method === fight.method) {
            totalPoints += 20;

            // Nível 3: Round/Type
            // Apenas se passou pelo Nível 2
            if (pick.round === fight.round_end) {
                totalPoints += 10;
            }
        }

        return totalPoints;
    }
}
