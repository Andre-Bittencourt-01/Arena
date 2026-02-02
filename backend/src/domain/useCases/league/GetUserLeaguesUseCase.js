export class GetUserLeaguesUseCase {
    leagueRepository;
    constructor(leagueRepository) {
        this.leagueRepository = leagueRepository;
    }
    async execute(userId) {
        return await this.leagueRepository.findByUserId(userId);
    }
}
//# sourceMappingURL=GetUserLeaguesUseCase.js.map