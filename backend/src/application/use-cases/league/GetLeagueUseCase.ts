import { ILeagueRepository } from "../../../domain/repositories/ILeagueRepository.js";

export class GetLeagueUseCase {
    constructor(private leagueRepository: ILeagueRepository) { }

    async execute(id: string) {
        const league = await this.leagueRepository.findById(id);

        if (!league) {
            throw new Error("League not found");
        }

        return league;
    }
}
