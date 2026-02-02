export class JoinLeagueUseCase {
    leagueRepository;
    constructor(leagueRepository) {
        this.leagueRepository = leagueRepository;
    }
    async execute(request) {
        const league = await this.leagueRepository.findById(request.leagueId);
        if (!league) {
            throw new Error("League not found");
        }
        // Add member with default role 'MEMBER'
        return await this.leagueRepository.addMember(request.leagueId, request.userId, "MEMBER");
    }
}
//# sourceMappingURL=JoinLeagueUseCase.js.map