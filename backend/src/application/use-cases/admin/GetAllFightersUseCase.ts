import { IFighterRepository } from "../../../domain/repositories/IFighterRepository.js";

export class GetAllFightersUseCase {
    constructor(private fighterRepository: IFighterRepository) { }

    async execute() {
        return await this.fighterRepository.findAll();
    }
}
