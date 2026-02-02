import { ILeagueRepository } from '../../repositories/ILeagueRepository.js';

export interface LeaderboardEntry {
    position: number;
    name: string;
    points: number;
    avatar_url: string | null;
}

export class GetLeagueLeaderboardUseCase {
    constructor(private leagueRepository: ILeagueRepository) { }

    async execute(leagueId: string): Promise<LeaderboardEntry[]> {
        const members = await this.leagueRepository.findMembersWithPoints(leagueId);

        return members.map((member, index) => ({
            position: index + 1,
            name: member.user.name,
            points: member.user.points,
            avatar_url: member.user.avatar_url
        }));
    }
}


