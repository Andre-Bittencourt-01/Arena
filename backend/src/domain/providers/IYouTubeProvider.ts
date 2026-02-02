export interface IYouTubeProvider {
    /**
     * Checks if the user is a member of the channel.
     * @param accessToken Google OAuth2 access token
     * @param channelId Optional. The channel ID to check membership against.
     */
    isMember(accessToken: string, channelId: string): Promise<boolean>;
}
