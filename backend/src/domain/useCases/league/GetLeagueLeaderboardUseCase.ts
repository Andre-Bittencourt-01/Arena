import { ILeagueRepository } from '../../repositories/ILeagueRepository.js';

export interface LeaderboardEntry {
    id: string;
    position: number;
    name: string;
    points: number;
    avatar_url: string | null;
    rank_delta: number; // New field for UI Arrows
}

export class GetLeagueLeaderboardUseCase {
    constructor(private leagueRepository: ILeagueRepository) { }

    async execute(leagueId: string, filters: { eventId?: string, month?: string, year?: string } = {}): Promise<LeaderboardEntry[]> {
        // Repository already fetches 'user' relation with delta fields
        const members = await this.leagueRepository.findMembersWithPoints(leagueId, filters);

        return members.map((member, index) => {
            // Logic: Decide which delta to show based on the context
            let delta = 0;

            if (filters.year) {
                // Year View: Show evolution within the year
                delta = member.user.yearly_rank_delta || 0;
            } else if (filters.month) {
                // Month View: Show evolution within the month
                delta = member.user.monthly_rank_delta || 0;
            }
            // Event View: Delta is usually 0 (Race Mode handles transient changes, or we keep it 0)

            return {
                id: member.user_id,
                position: index + 1,
                name: member.user.name,
                points: member.user.points,
                avatar_url: member.user.avatar_url,
                rank_delta: delta
            };
        });
    }
}
