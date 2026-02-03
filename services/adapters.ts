import { UserDTO, LeagueDTO, User, League, LeagueMember, LeagueMemberDTO, PickDTO, Pick } from '../types';

export const mapUserDTOToDomain = (dto: UserDTO): User => ({
    id: dto.id,
    email: dto.email,
    name: dto.name,
    avatar: dto.avatar_url || `https://ui-avatars.com/api/?name=${dto.name}`,
    points: dto.points,
    monthlyPoints: dto.monthly_points,
    yearlyPoints: dto.yearly_points,
    monthlyRankDelta: dto.monthly_rank_delta,
    yearlyRankDelta: dto.yearly_rank_delta || 0,
    isYoutubeMember: dto.is_youtube_member,
    createdAt: new Date(dto.created_at),
    lastSync: dto.last_youtube_sync ? new Date(dto.last_youtube_sync) : undefined
});

export const mapLeagueMemberDTOToDomain = (dto: LeagueMemberDTO): LeagueMember => ({
    id: dto.id,
    leagueId: dto.league_id,
    userId: dto.user_id,
    role: dto.role,
    joinedAt: new Date(dto.joined_at),
    userName: dto.user?.name,
    userAvatar: dto.user?.avatar_url || (dto.user?.name ? `https://ui-avatars.com/api/?name=${dto.user.name}` : undefined),
    userPoints: dto.user?.points
});

export const mapLeagueDTOToDomain = (dto: LeagueDTO): League => {
    const rawMembers = dto.members || [];
    return {
        id: dto.id,
        name: dto.name,
        description: dto.description || '',
        inviteCode: dto.invite_code,
        logo: dto.logo_url || 'https://github.com/shadcn.png',
        ownerId: dto.owner_id,
        members: rawMembers.map(m => m.user_id),
        admins: rawMembers
            .filter(m => m.role === 'ADMIN' || m.role === 'OWNER')
            .map(m => m.user_id),
        membersCount: rawMembers.length,
        createdAt: new Date(dto.created_at)
    };
};

export const mapPickDTOToDomain = (dto: PickDTO): Pick => ({
    id: dto.id,
    userId: dto.user_id,
    eventId: dto.event_id,
    fightId: dto.fight_id,
    fighterId: dto.fighter_id,
    method: dto.method,
    round: dto.round,
    pointsEarned: dto.points_earned,
    adminNote: dto.admin_note
});
