import { IFightRepository } from "../../../domain/repositories/IFightRepository.js";

export class GetEventFightsUseCase {
    constructor(private fightRepository: IFightRepository) { }

    async execute(eventId: string) {
        return await this.fightRepository.findByEventId(eventId);
    }
}
