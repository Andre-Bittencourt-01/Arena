import { ILeagueRepository } from '../../repositories/ILeagueRepository.js';
export declare class GetUserLeaguesUseCase {
    private leagueRepository;
    constructor(leagueRepository: ILeagueRepository);
    execute(userId: string): Promise<{
        name: string;
        id: string;
        description: string | null;
        invite_code: string;
        logo_url: string | null;
        created_at: Date;
        owner_id: string;
    }[]>;
}
