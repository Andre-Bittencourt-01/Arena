import { IFightRepository, CreateFightDTO } from "../../../domain/repositories/IFightRepository.js";

export class CreateFightUseCase {
    constructor(private fightRepository: IFightRepository) { }

    async execute(data: CreateFightDTO) {
        // FIX: Return the created object so the Controller sends it back
        return await this.fightRepository.create(data);
    }
}
