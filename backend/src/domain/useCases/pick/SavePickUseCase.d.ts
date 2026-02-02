import { IPickRepository, SavePickDTO } from '../../repositories/IPickRepository.js';
import { IFightRepository } from '../../repositories/IFightRepository.js';
import { Pick } from "@prisma/client";
export declare class SavePickUseCase {
    private pickRepository;
    private fightRepository;
    constructor(pickRepository: IPickRepository, fightRepository: IFightRepository);
    execute(data: SavePickDTO): Promise<Pick>;
}
