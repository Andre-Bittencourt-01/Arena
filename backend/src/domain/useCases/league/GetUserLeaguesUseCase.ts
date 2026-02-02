import { ILeagueRepository } from '../../repositories/ILeagueRepository.js';

export class GetUserLeaguesUseCase {
    constructor(private leagueRepository: ILeagueRepository) { }

    async execute(userId: string) {
        return await this.leagueRepository.findByUserId(userId);
    }
}


