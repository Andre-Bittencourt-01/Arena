import { ILeagueRepository } from '../../repositories/ILeagueRepository.js';
export interface LeaderboardEntry {
    position: number;
    name: string;
    points: number;
    avatar_url: string | null;
}
export declare class GetLeagueLeaderboardUseCase {
    private leagueRepository;
    constructor(leagueRepository: ILeagueRepository);
    execute(leagueId: string): Promise<LeaderboardEntry[]>;
}
