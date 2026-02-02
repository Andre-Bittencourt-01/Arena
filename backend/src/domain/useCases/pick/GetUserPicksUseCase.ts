import { IPickRepository } from '../../repositories/IPickRepository.js';

interface GetUserPicksRequest {
    userId: string;
    eventId: string;
}

export class GetUserPicksUseCase {
    constructor(private pickRepository: IPickRepository) { }

    async execute(request: GetUserPicksRequest) {
        return await this.pickRepository.findByUserAndEvent(request.userId, request.eventId);
    }
}


