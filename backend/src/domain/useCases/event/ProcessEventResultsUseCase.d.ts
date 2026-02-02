import { IFightRepository } from '../../repositories/IFightRepository.js';
import { IPickRepository } from '../../repositories/IPickRepository.js';
import { IUserRepository } from '../../repositories/IUserRepository.js';
import { ScoringService } from '../../services/ScoringService.js';
interface FightResult {
    fightId: string;
    winnerId: string;
    method: string;
    round: string;
}
interface ProcessEventResultsRequest {
    eventId: string;
    results: FightResult[];
}
export declare class ProcessEventResultsUseCase {
    private fightRepository;
    private pickRepository;
    private userRepository;
    private scoringService;
    constructor(fightRepository: IFightRepository, pickRepository: IPickRepository, userRepository: IUserRepository, scoringService: ScoringService);
    execute(request: ProcessEventResultsRequest): Promise<void>;
}
export {};
