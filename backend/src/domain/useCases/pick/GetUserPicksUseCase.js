export class GetUserPicksUseCase {
    pickRepository;
    constructor(pickRepository) {
        this.pickRepository = pickRepository;
    }
    async execute(request) {
        return await this.pickRepository.findByUserAndEvent(request.userId, request.eventId);
    }
}
//# sourceMappingURL=GetUserPicksUseCase.js.map