import { IUserRepository } from '../../repositories/IUserRepository.js';
import { IYouTubeProvider } from '../../providers/IYouTubeProvider.js';
interface SyncYoutubeStatusRequest {
    userId: string;
    googleToken: string;
}
export declare class SyncYoutubeStatusUseCase {
    private userRepository;
    private youtubeProvider;
    constructor(userRepository: IUserRepository, youtubeProvider: IYouTubeProvider);
    execute({ userId, googleToken }: SyncYoutubeStatusRequest): Promise<void>;
}
export {};
