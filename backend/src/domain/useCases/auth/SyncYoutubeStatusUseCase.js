export class SyncYoutubeStatusUseCase {
    userRepository;
    youtubeProvider;
    constructor(userRepository, youtubeProvider) {
        this.userRepository = userRepository;
        this.youtubeProvider = youtubeProvider;
    }
    async execute({ userId, googleToken }) {
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
//# sourceMappingURL=SyncYoutubeStatusUseCase.js.map