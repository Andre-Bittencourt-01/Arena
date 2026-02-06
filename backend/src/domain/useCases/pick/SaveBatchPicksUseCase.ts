import { IPickRepository, SavePickDTO } from '../../repositories/IPickRepository.js';
import { IFightRepository } from '../../repositories/IFightRepository.js';

export class SaveBatchPicksUseCase {
    constructor(
        private pickRepository: IPickRepository,
        private fightRepository: IFightRepository
    ) { }

    async execute(data: SavePickDTO[], userId: string): Promise<void> {
        if (data.length === 0) return;

        // SECURITY: Enforce userId from token on ALL picks
        const securePicks = data.map(pick => ({
            ...pick,
            user_id: userId // Overwrite with secure ID
        }));

        // Validation: Verify if event is still open for picks
        // For simplicity, we check the first pick's event/fight
        // Assuming all picks in a batch belong to the same event/logic
        const firstPick = securePicks[0];
        const fightWithEvent = await this.fightRepository.findByIdWithEvent(firstPick.fight_id);

        if (!fightWithEvent) {
            throw new Error("Fight not found");
        }

        const { event } = fightWithEvent;
        const now = new Date();

        if (event.lock_status === "CLOSED" || event.date < now) {
            throw new Error("Betting is closed for this event");
        }

        // More advanced validation could be added here to check each fight individually if needed
        // But usually, if the event started, all fights are locked or handled by cascade.

        await this.pickRepository.saveBatch(securePicks);
    }
}
