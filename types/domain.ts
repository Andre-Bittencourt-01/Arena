/**
 * Domain Models
 * Sanitized and camelCase versions of entities for clean UI consumption.
 */

export interface User {
    id: string;
    email: string;
    name: string;
    avatar: string; // Sanitized with fallback
    points: number;
    monthlyPoints: number;
    yearlyPoints: number;
    monthlyRankDelta: number;
    yearlyRankDelta: number;
    isYoutubeMember: boolean;
    createdAt: Date;
    lastSync?: Date;
    password?: string; // Used for local mocks/dev
}

export interface League {
    id: string;
    name: string;
    description: string; // Default to empty string if null
    inviteCode: string;
    logo: string; // Sanitized with fallback
    ownerId: string;
    members: string[]; // Array of User IDs
    admins: string[]; // Array of User IDs (Owner + Admins)
    membersCount: number;
    createdAt: Date;
}

export interface LeagueMember {
    id: string;
    leagueId: string;
    userId: string;
    role: 'OWNER' | 'ADMIN' | 'MEMBER';
    joinedAt: Date;
    userName?: string; // Opt-in decoration
    userAvatar?: string;
    userPoints?: number;
}

export interface Pick {
    id: string;
    userId: string;
    eventId: string;
    fightId: string;
    fighterId: string; // The fighter picked to win
    method?: 'KO/TKO' | 'SUB' | 'DEC';
    round?: string;
    pointsEarned?: number;
    adminNote?: string;
}
