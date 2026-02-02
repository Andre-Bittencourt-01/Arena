import { ILeagueRepository } from '../../repositories/ILeagueRepository.js';
import { League } from "@prisma/client";
interface CreateLeagueRequest {
    name: string;
    description?: string;
    ownerId: string;
}
export declare class CreateLeagueUseCase {
    private leagueRepository;
    constructor(leagueRepository: ILeagueRepository);
    execute(request: CreateLeagueRequest): Promise<League>;
}
export {};
