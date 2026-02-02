import { ILeagueRepository } from '../../../domain/repositories/ILeagueRepository.js';
export declare class ListLeaguesUseCase {
    private leagueRepository;
    constructor(leagueRepository: ILeagueRepository);
    execute(): Promise<({
        name: string;
        id: string;
        description: string | null;
        invite_code: string;
        logo_url: string | null;
        created_at: Date;
        owner_id: string;
    } & {
        _count?: {
            members: number;
        };
    })[]>;
}
