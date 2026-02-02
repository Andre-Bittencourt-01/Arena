import { IYouTubeProvider } from '../../domain/providers/IYouTubeProvider.js';
export declare class GoogleYouTubeProvider implements IYouTubeProvider {
    isMember(accessToken: string, channelId: string): Promise<boolean>;
}
