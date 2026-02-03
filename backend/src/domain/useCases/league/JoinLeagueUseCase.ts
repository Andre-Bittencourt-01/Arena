import { ILeagueRepository } from '../../repositories/ILeagueRepository.js';
import { LeagueMember } from "@prisma/client";

interface JoinLeagueRequest {
    league_id: string;
    user_id: string;
}

export class JoinLeagueUseCase {
    constructor(private leagueRepository: ILeagueRepository) { }

    async execute(request: JoinLeagueRequest): Promise<LeagueMember> {
        const league = await this.leagueRepository.findById(request.league_id);

        if (!league) {
            throw new Error("League not found");
        }

        // Add member with default role 'MEMBER'
        return await this.leagueRepository.addMember(request.league_id, request.user_id, "MEMBER");
    }
}


