import { ILeagueRepository } from '../../../domain/repositories/ILeagueRepository.js';

export class ListLeaguesUseCase {
    constructor(private leagueRepository: ILeagueRepository) { }

    async execute() {
        return await this.leagueRepository.findAll();
    }
}
