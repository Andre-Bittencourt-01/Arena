import { IFightRepository } from '../../repositories/IFightRepository.js';
import { IPickRepository } from '../../repositories/IPickRepository.js';
import { IUserRepository } from '../../repositories/IUserRepository.js';
import { ScoringService } from '../../services/ScoringService.js';

interface FightResult {
    fight_id: string;
    winner_id: string;
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
            await this.fightRepository.update(result.fight_id, {
                winner_id: result.winner_id,
                method: result.method,
            });
        }

        // 2. Fetch all picks for this event
        const picks = await this.pickRepository.findByEvent(request.eventId);

        // 3. Process each pick
        for (const pick of picks) {
            // Find the fight details for this pick to calculate score
            const fightResult = request.results.find(r => r.fight_id === pick.fight_id);
            if (!fightResult) continue;

            // We need a Fight object for the ScoringService. 
            const mockFight: any = {
                id: fightResult.fight_id,
                winner_id: fightResult.winner_id,
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


