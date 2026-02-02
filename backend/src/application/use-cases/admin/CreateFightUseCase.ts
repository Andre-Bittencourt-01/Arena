import { IFightRepository, CreateFightDTO } from "../../../domain/repositories/IFightRepository.js";

export class CreateFightUseCase {
    constructor(private fightRepository: IFightRepository) { }

    async execute(data: CreateFightDTO): Promise<void> {
        await this.fightRepository.create(data);
    }
}
