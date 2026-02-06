import { IPickRepository, SavePickDTO } from '../../repositories/IPickRepository.js';
import { IFightRepository } from '../../repositories/IFightRepository.js';
import { Pick } from "@prisma/client";

export class SavePickUseCase {
    constructor(
        private pickRepository: IPickRepository,
        private fightRepository: IFightRepository
    ) { }

    async execute(data: SavePickDTO, userId: string): Promise<Pick> {
        // SECURITY: Enforce userId from token
        const secureData = {
            ...data,
            user_id: userId // Overwrite with secure ID
        };

        const fightWithEvent = await this.fightRepository.findByIdWithEvent(secureData.fight_id);

        if (!fightWithEvent) {
            throw new Error("Fight not found");
        }

        const { event } = fightWithEvent;
        const now = new Date();

        // 1. Check if event is locked manually
        if (event.lock_status === "CLOSED") {
            throw new Error("Betting is closed for this event");
        }

        // 2. Check if event has already started (Critical Validation)
        if (event.date < now) {
            throw new Error("Betting is closed for this fight (Event already started)");
        }

        return await this.pickRepository.save(secureData);
    }
}


