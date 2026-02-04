import { IFightRepository, CreateFightDTO } from "../../../domain/repositories/IFightRepository.js";

export class CreateFightUseCase {
    constructor(private fightRepository: IFightRepository) { }

    // FIX: Removed Promise<void> to allow returning the object
    async execute(data: CreateFightDTO) {
        return await this.fightRepository.create(data);
    }
}
