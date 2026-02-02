export class GoogleYouTubeProvider {
    async isMember(accessToken, channelId) {
        try {
            // Documentação: https://developers.google.com/youtube/v3/docs/members/list
            // Endpoint verifica se o dono do token é membro do canal especificado
            const response = await fetch(`https://www.googleapis.com/youtube/v3/members?part=snippet&filterByMemberChannelId=${channelId}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            if (!response.ok) {
                const error = await response.json();
                console.error("YouTube API Error:", error);
                return false;
            }
            const data = await response.json();
            // Se retornar itens, significa que existe uma assinatura ativa (membro)
            return data.items && data.items.length > 0;
        }
        catch (error) {
            console.error("YouTube Provider Exception:", error);
            return false;
        }
    }
}
//# sourceMappingURL=GoogleYouTubeProvider.js.map