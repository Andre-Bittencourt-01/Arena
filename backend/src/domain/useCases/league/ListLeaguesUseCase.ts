import { League } from '../../entities/League.js';
import { ILeagueRepository } from '../../repositories/ILeagueRepository.js';
import { IUserRepository } from '../../repositories/IUserRepository.js';

export class ListLeaguesUseCase {
    constructor(
        private leagueRepository: ILeagueRepository,
        private userRepository: IUserRepository
    ) { }

    async execute(userId?: string) {
        // 1. Fetch All Leagues
        const allLeagues = await this.leagueRepository.findAll();

        // DEBUG: Check if backend is seeing the field
        console.log("DEBUG LEAGUE FLAG (Domain):", allLeagues.find(l => l.name === 'Arena MMA Global' || l.name === 'ARENA MMA GLOBAL')?.is_system);

        // 2. Determine Permissions
        let isAdmin = false;
        if (userId) {
            const user = await this.userRepository.findById(userId);
            isAdmin = user?.role === 'ADMIN' || user?.role === 'OWNER';
        }

        // 3. Apply Filter
        if (isAdmin) {
            return allLeagues;
        }

        // Non-admins (or unauthenticated) only see non-system leagues
        return allLeagues.filter(league => !league.is_system);
    }
}
