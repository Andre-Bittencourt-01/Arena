export class GetLeagueLeaderboardUseCase {
    leagueRepository;
    constructor(leagueRepository) {
        this.leagueRepository = leagueRepository;
    }
    async execute(leagueId) {
        const members = await this.leagueRepository.findMembersWithPoints(leagueId);
        return members.map((member, index) => ({
            position: index + 1,
            name: member.user.name,
            points: member.user.points,
            avatar_url: member.user.avatar_url
        }));
    }
}
//# sourceMappingURL=GetLeagueLeaderboardUseCase.js.map