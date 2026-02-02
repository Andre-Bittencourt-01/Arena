import { IUserRepository } from '../../repositories/IUserRepository.js';
import { IYouTubeProvider } from '../../providers/IYouTubeProvider.js';

interface SyncYoutubeStatusRequest {
    userId: string;
    googleToken: string;
}

export class SyncYoutubeStatusUseCase {
    constructor(
        private userRepository: IUserRepository,
        private youtubeProvider: IYouTubeProvider
    ) { }

    async execute({ userId, googleToken }: SyncYoutubeStatusRequest): Promise<void> {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new Error("User not found");
        }

        const channelId = process.env.YOUTUBE_CHANNEL_ID;
        if (!channelId) {
            throw new Error("YOUTUBE_CHANNEL_ID not configured");
        }

        const isMember = await this.youtubeProvider.isMember(googleToken, channelId);

        await this.userRepository.update(userId, {
            isYoutubeMember: isMember,
            lastYoutubeSync: new Date()
        });
    }
}


