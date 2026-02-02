import { IFightRepository } from '../../repositories/IFightRepository.js';
import { IPickRepository } from '../../repositories/IPickRepository.js';
import { IUserRepository } from '../../repositories/IUserRepository.js';
import { ScoringService } from '../../services/ScoringService.js';

interface FightResult {
    fightId: string;
    winnerId: string;
    method: string;
    round: string;
}

interface ProcessEventResultsRequest {
    eventId: string;
    results: FightResult[];
}

export class ProcessEventResultsUseCase {
    constructor(
        private fightRepository: IFightRepository,
        private pickRepository: IPickRepository,
        private userRepository: IUserRepository,
        private scoringService: ScoringService
    ) { }

    async execute(request: ProcessEventResultsRequest): Promise<void> {
        // 1. Update all fights with official results
        for (const result of request.results) {
            await this.fightRepository.update(result.fightId, {
                winner_id: result.winnerId,
                method: result.method,
                // Assuming schema might need round_end or similar, 
                // but let's stick to what we have or Partial<Fight>
            });
        }

        // 2. Fetch all picks for this event
        const picks = await this.pickRepository.findByEvent(request.eventId);

        // 3. Process each pick
        for (const pick of picks) {
            // Find the fight details for this pick to calculate score
            const fightResult = request.results.find(r => r.fightId === pick.fight_id);
            if (!fightResult) continue;

            // We need a Fight object for the ScoringService. 
            // We can create a mock/partial one from the result since we just updated it.
            const mockFight: any = {
                id: fightResult.fightId,
                winner_id: fightResult.winnerId,
                method: fightResult.method
            };

            const points = this.scoringService.calculatePoints(pick, mockFight);

            if (points > 0) {
                // Update pick points
                await this.pickRepository.updatePoints(pick.id, points);

                // Update user points
                await this.userRepository.incrementPoints(pick.user_id, points);
            }
        }
    }
}


