export class GetUpcomingEventsUseCase {
    eventRepository;
    constructor(eventRepository) {
        this.eventRepository = eventRepository;
    }
    async execute() {
        return await this.eventRepository.findUpcoming();
    }
}
//# sourceMappingURL=GetUpcomingEventsUseCase.js.map