import { ILeagueRepository } from "../../../domain/repositories/ILeagueRepository.js";

interface UpdateLeagueRequest {
    leagueId: string;
    userId: string;
    name?: string;
    description?: string;
    logo_url?: string;
}

export class UpdateLeagueUseCase {
    constructor(private leagueRepository: ILeagueRepository) { }

    async execute({ leagueId, userId, name, description, logo_url }: UpdateLeagueRequest) {
        const league = await this.leagueRepository.findById(leagueId);

        if (!league) {
            throw new Error("League not found");
        }

        // Role check: Only owner can update
        if (league.owner_id !== userId) {
            throw new Error("Only the owner can update the league");
        }

        const updatedLeague = await this.leagueRepository.update(leagueId, {
            name,
            description,
            logo_url
        } as any);

        return updatedLeague;
    }
}
