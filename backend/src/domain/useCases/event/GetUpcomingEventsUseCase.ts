import { IEventRepository } from '../../repositories/IEventRepository.js';

export class GetUpcomingEventsUseCase {
    constructor(private eventRepository: IEventRepository) { }

    async execute() {
        return await this.eventRepository.findUpcoming();
    }
}


