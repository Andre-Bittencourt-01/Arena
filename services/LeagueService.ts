import api from './api';

export interface LeaderboardEntry {
    position: number;
    name: string;
    points: number;
    avatar_url: string | null;
}

export const LeagueService = {
    getLeaderboard: async (leagueId: string): Promise<LeaderboardEntry[]> => {
        const response = await api.get(`/leagues/${leagueId}/leaderboard`);
        return response.data;
    }
};

export default LeagueService;
