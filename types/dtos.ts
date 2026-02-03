/**
 * DTOs (Data Transfer Objects)
 * 1:1 Mirror of the Backend/Database response format (snake_case).
 */

export type LeagueRoleDTO = 'OWNER' | 'ADMIN' | 'MEMBER';

export interface UserDTO {
    id: string;
    email: string;
    name: string;
    avatar_url: string | null;
    created_at: string; // ISO string from backend
    is_youtube_member: boolean;
    points: number;
    monthly_points: number;
    yearly_points: number;
    monthly_rank_delta: number;
    yearly_rank_delta: number;
    youtube_channel_id: string | null;
    last_youtube_sync: string | null;
}

export interface LeagueDTO {
    id: string;
    name: string;
    description: string | null;
    invite_code: string;
    logo_url: string | null;
    created_at: string; // ISO string from backend
    owner_id: string;
    members?: LeagueMemberDTO[]; // Populated via include
}

export interface LeagueMemberDTO {
    id: string;
    league_id: string;
    user_id: string;
    role: LeagueRoleDTO;
    joined_at: string;
    user?: UserDTO; // Optional inclusion
}

export interface PickDTO {
    id: string;
    user_id: string;
    event_id: string;
    fight_id: string;
    fighter_id: string;
    method?: 'KO/TKO' | 'SUB' | 'DEC';
    round?: string;
    points_earned?: number;
    admin_note?: string;
}
