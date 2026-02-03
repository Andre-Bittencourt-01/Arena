import { ILeagueRepository } from '../../repositories/ILeagueRepository.js';
import { League } from "@prisma/client";

interface CreateLeagueRequest {
    name: string;
    description?: string;
    owner_id: string;
}

export class CreateLeagueUseCase {
    constructor(private leagueRepository: ILeagueRepository) { }

    async execute(request: CreateLeagueRequest): Promise<League> {
        // Generate a simple 6-character random invite code
        const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        const league = await this.leagueRepository.create({
            name: request.name,
            description: request.description,
            inviteCode: inviteCode,
            ownerId: request.owner_id
        });

        return league;
    }
}


