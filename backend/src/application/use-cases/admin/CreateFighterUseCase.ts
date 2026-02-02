import { Fighter } from "@prisma/client";
import { IFighterRepository } from "../../../domain/repositories/IFighterRepository.js";

interface CreateFighterRequest {
    name: string;
    nickname?: string;
    image_url?: string;
}

export class CreateFighterUseCase {
    constructor(private fighterRepository: IFighterRepository) { }

    async execute(data: CreateFighterRequest): Promise<Fighter> {
        return await this.fighterRepository.create({
            name: data.name,
            nickname: data.nickname || null,
            image_url: data.image_url || null
        });
    }
}
