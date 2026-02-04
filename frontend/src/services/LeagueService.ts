import api from './api';

export interface LeaderboardEntry {
    position: number;
    name: string;
    points: number;
    avatar_url: string | null;
}

export const LeagueService = {
    get_leaderboard: async (league_id: string): Promise<LeaderboardEntry[]> => {
        const response = await api.get(`/leagues/${league_id}/leaderboard`);
        return response.data;
    }
};

export default LeagueService;
