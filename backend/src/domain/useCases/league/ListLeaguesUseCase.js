export class ListLeaguesUseCase {
    leagueRepository;
    constructor(leagueRepository) {
        this.leagueRepository = leagueRepository;
    }
    async execute() {
        return await this.leagueRepository.findAll();
    }
}
//# sourceMappingURL=ListLeaguesUseCase.js.map