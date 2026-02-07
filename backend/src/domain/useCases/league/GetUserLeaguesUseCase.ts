import { ILeagueRepository } from '../../repositories/ILeagueRepository.js';
import { IUserRepository } from '../../repositories/IUserRepository.js';

export class GetUserLeaguesUseCase {
    constructor(
        private leagueRepository: ILeagueRepository,
        private userRepository: IUserRepository
    ) { }

    async execute(userId: string, requestingUserId?: string) {
        // 1. Fetch the target user's leagues
        const userLeagues = await this.leagueRepository.findByUserId(userId);

        // 2. Determine permissions of the requesting user
        let isAdmin = false;
        if (requestingUserId) {
            const currentUser = await this.userRepository.findById(requestingUserId);
            isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'OWNER';
        }

        // 3. Apply Filter
        if (isAdmin) {
            return userLeagues;
        }

        // Non-admins only see non-system leagues in the user's profile
        return userLeagues.filter(league => !league.is_system);
    }
}


