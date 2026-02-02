export class SavePickUseCase {
    pickRepository;
    fightRepository;
    constructor(pickRepository, fightRepository) {
        this.pickRepository = pickRepository;
        this.fightRepository = fightRepository;
    }
    async execute(data) {
        const fightWithEvent = await this.fightRepository.findByIdWithEvent(data.fightId);
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
        return await this.pickRepository.save(data);
    }
}
//# sourceMappingURL=SavePickUseCase.js.map