/**
 * UNIFIED TYPE DEFINITIONS
 * Architecture: Zero-Translation (Snake_Case Fullstack)
 * Strategy: Raw Data from API -> UI
 */

// --- Enums & Unions (String Based) ---
export type WeightClass = 'Galo' | 'Mosca' | 'Leve' | 'Médio' | 'Pesado' | 'M. Pesado' | 'Catch';
export type FightCategory = 'Main Event' | 'Co-Main' | 'Main Card' | 'Prelim' | 'Early';
export type EventStatus = 'upcoming' | 'live' | 'completed';
export type FightResult = 'win' | 'draw' | 'nc';
export type LeagueRole = 'OWNER' | 'ADMIN' | 'MEMBER';
export type RankingPeriod = 'week' | 'month' | 'year' | 'all';

// --- Entities (Snake_Case & Strings) ---

export interface User {
    id: string;
    email: string;
    name: string;
    avatar_url: string | null;
    created_at: string;        // ISO String
    is_youtube_member: boolean;
    points: number;
    monthly_points: number;
    yearly_points: number;
    monthly_rank_delta: number;
    yearly_rank_delta: number;
    youtube_channel_id: string | null;
    last_youtube_sync: string | null;
}

export interface Fighter {
    id: string;
    name: string;
    nickname?: string;
    image_url: string;
    wins: number;
    losses: number;
    draws: number;
    nc: number;
}

export interface Fight {
    id: string;
    event_id: string;
    fighter_a_id: string;
    fighter_b_id: string;
    winner_id?: string;

    // Denormalized/Populated fields
    fighter_a?: Fighter;
    fighter_b?: Fighter;

    category: FightCategory;
    weight_class: WeightClass;
    rounds: number;
    is_title?: boolean;

    // Results
    result?: FightResult;
    method?: string;
    round_end?: string;
    time?: string;
    points: number;

    // Locking
    lock_status?: 'open' | 'locked';
    custom_lock_time?: string; // ISO String
    order?: number;
    video_url?: string;
}

export interface BannerConfig {
    x: number;
    y: number;
    scale: number;
}

export interface Event {
    id: string;
    title: string;
    subtitle: string;
    date: string;       // ISO String
    end_date?: string;  // ISO String
    location: string;
    banner_url: string;
    status: EventStatus;

    // Locking
    lock_status?: 'open' | 'locked' | 'scheduled' | 'cascade';
    lock_time?: string; // ISO String
    cascade_start_time?: string; // ISO String

    // Banner Settings (JSON field in DB)
    banner_settings?: {
        dashboard?: { desktop?: BannerConfig; mobile?: BannerConfig };
        list?: { desktop?: BannerConfig; mobile?: BannerConfig };
        summary?: { desktop?: BannerConfig; mobile?: BannerConfig };
    };

    _count?: {
        fights: number;
    };
}

export interface Pick {
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

export interface League {
    id: string;
    name: string;
    description: string | null;
    invite_code: string;
    logo_url: string | null;
    created_at: string;
    owner_id: string;
    members_count?: number;
    members?: LeagueMember[];
}

export interface LeagueMember {
    id: string;
    league_id: string;
    user_id: string;
    role: LeagueRole;
    joined_at: string;
    user?: User;
}

// --- Service Contracts (Updated to Snake_Case) ---

export interface IDataService {
    // Events
    get_events(): Promise<Event[]>;
    get_event(id: string): Promise<Event | null>;
    create_event(event: Omit<Event, 'id'>): Promise<Event>;
    update_event(event: Event): Promise<Event>;
    delete_event(id: string): Promise<void>;
    get_admin_events(): Promise<Event[]>;

    // Fights
    get_fights(event_id: string): Promise<Fight[]>;
    create_fight(fight: Fight): Promise<Fight>;
    update_fight(fight: Fight): Promise<Fight>;
    delete_fight(id: string): Promise<void>;

    // Fighters
    get_fighters(): Promise<Fighter[]>;
    create_fighter(fighter: Omit<Fighter, 'id'>): Promise<Fighter>;

    // Picks
    get_picks_for_event: (event_id: string) => Promise<Record<string, Pick>>;
    get_all_picks_for_event: (event_id: string) => Promise<Pick[]>;
    submit_pick: (payload: any) => Promise<void>;
    submit_picks_batch: (picks: any[]) => Promise<void>;

    // Leaderboard
    get_leaderboard: (period?: RankingPeriod, period_id?: string) => Promise<User[]>;

    // Auth & Users
    login(email: string, password: string): Promise<User | null>;
    get_me(): Promise<User | null>;
    get_user_by_id(id: string): Promise<User | null>;

    // Leagues
    get_leagues(): Promise<League[]>;
    create_league(name: string, owner_id: string, description?: string, logo_url?: string): Promise<League>;
    join_league(invite_code: string, user_id: string): Promise<League>;
    get_leagues_for_user(user_id: string): Promise<League[]>;
    get_league_by_invite_code(code: string): Promise<League | null>;
    get_league_by_id(id: string): Promise<League | null>;
    update_league(id: string, data: { name: string, description: string, logo_url?: string }): Promise<League>;
    delete_league(id: string): Promise<void>;
    remove_member(league_id: string, user_id: string): Promise<League>;
    manage_admin(league_id: string, user_id: string, action: 'promote' | 'demote'): Promise<League>;
}

