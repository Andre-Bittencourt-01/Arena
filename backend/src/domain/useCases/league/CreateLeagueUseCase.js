export class CreateLeagueUseCase {
    leagueRepository;
    constructor(leagueRepository) {
        this.leagueRepository = leagueRepository;
    }
    async execute(request) {
        // Generate a simple 6-character random invite code
        const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const league = await this.leagueRepository.create({
            name: request.name,
            description: request.description,
            inviteCode: inviteCode,
            ownerId: request.ownerId
        });
        return league;
    }
}
//# sourceMappingURL=CreateLeagueUseCase.js.map