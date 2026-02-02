import { IPickRepository } from '../../repositories/IPickRepository.js';
interface GetUserPicksRequest {
    userId: string;
    eventId: string;
}
export declare class GetUserPicksUseCase {
    private pickRepository;
    constructor(pickRepository: IPickRepository);
    execute(request: GetUserPicksRequest): Promise<{
        id: string;
        user_id: string;
        fight_id: string;
        event_id: string;
        fighter_id: string;
        method: string;
        round: string;
        points_earned: number;
    }[]>;
}
export {};
