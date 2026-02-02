import { IEventRepository } from "../../../domain/repositories/IEventRepository.js";

export class GetAllEventsUseCase {
    constructor(private repository: IEventRepository) { }

    async execute() {
        return await this.repository.findAll();
    }
}
