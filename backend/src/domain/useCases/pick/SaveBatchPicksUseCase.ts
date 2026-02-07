import { IPickRepository, SavePickDTO } from '../../repositories/IPickRepository.js';
import { IFightRepository } from '../../repositories/IFightRepository.js';

export class SaveBatchPicksUseCase {
    constructor(
        private pickRepository: IPickRepository,
        private fightRepository: IFightRepository
    ) { }

    async execute(data: SavePickDTO[], userId: string): Promise<void> {
        if (data.length === 0) return;

        // SECURITY: Enforce userId from token
        const securePicks = data.map(pick => ({
            ...pick,
            user_id: userId
        }));

        const firstPick = securePicks[0];
        const fightWithEvent = await this.fightRepository.findByIdWithEvent(firstPick.fight_id);

        if (!fightWithEvent) {
            throw new Error("Fight not found");
        }

        const { event } = fightWithEvent;

        // 1. EVENT CHECK: Only block if event is totally closed
        if (event.lock_status === "CLOSED" || event.status === "COMPLETED") {
            throw new Error("Betting is closed for this event");
        }

        // 2. FETCH FIGHTS
        const eventFights = await this.fightRepository.findByEventId(event.id);

        // NEW: Filter valid picks instead of validating all-or-nothing
        const validPicks: typeof securePicks = [];

        for (const pick of securePicks) {
            const fight = eventFights.find(f => f.id === pick.fight_id);

            // If fight doesn't exist, skip
            if (!fight) continue;

            // 3. FIGHT LEVEL LOCK CHECK (HARDENED)
            const isFightLocked =
                fight.status !== 'SCHEDULED' || // Blocks COMPLETED, FINISHED, IN_PROGRESS
                !!fight.winner_id;              // Blocks if ANY winner is set (truthy)

            if (isFightLocked) {
                // SOFT SKIP: Don't throw error, just ignore this pick
                // This allows the open fights in the batch to be saved
                continue;
            }

            validPicks.push(pick);
        }

        // 4. SAVE ONLY VALID PICKS
        if (validPicks.length > 0) {
            await this.pickRepository.saveBatch(validPicks);
        }
    }
}
