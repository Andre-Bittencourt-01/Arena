import { IEventRepository } from "../../repositories/IEventRepository.js";

export class ListEventsUseCase {
    constructor(private eventRepository: IEventRepository) { }

    async execute() {
        // Garante ordenação por data (repository uses desc by default, which is good for history)
        return await this.eventRepository.findAll();
    }
}
