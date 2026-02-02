import { ILeagueRepository } from '../../repositories/ILeagueRepository.js';
import { LeagueMember } from "@prisma/client";
interface JoinLeagueRequest {
    leagueId: string;
    userId: string;
}
export declare class JoinLeagueUseCase {
    private leagueRepository;
    constructor(leagueRepository: ILeagueRepository);
    execute(request: JoinLeagueRequest): Promise<LeagueMember>;
}
export {};
