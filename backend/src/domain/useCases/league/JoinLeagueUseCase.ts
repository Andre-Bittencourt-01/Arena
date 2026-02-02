import { ILeagueRepository } from '../../repositories/ILeagueRepository.js';
import { LeagueMember } from "@prisma/client";

interface JoinLeagueRequest {
    leagueId: string;
    userId: string;
}

export class JoinLeagueUseCase {
    constructor(private leagueRepository: ILeagueRepository) { }

    async execute(request: JoinLeagueRequest): Promise<LeagueMember> {
        const league = await this.leagueRepository.findById(request.leagueId);

        if (!league) {
            throw new Error("League not found");
        }

        // Add member with default role 'MEMBER'
        return await this.leagueRepository.addMember(request.leagueId, request.userId, "MEMBER");
    }
}


