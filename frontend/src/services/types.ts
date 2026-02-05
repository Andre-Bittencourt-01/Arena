import { Event, Fight, Fighter, User, Pick, League } from '../types';

export type RankingPeriod = 'week' | 'month' | 'year' | 'all';

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
    reorder_fights(orders: { id: string, order: number }[]): Promise<void>;

    // Fighters
    get_fighters(): Promise<Fighter[]>;
    create_fighter(fighter: Omit<Fighter, 'id'>): Promise<Fighter>;
    get_picks_for_event: (event_id: string) => Promise<Record<string, Pick>>;

    // Picks Management (Admin)
    get_all_picks_for_event: (event_id: string) => Promise<Pick[]>;
    submit_pick: (payload: any) => Promise<void>;
    submit_picks_batch: (picks: any[]) => Promise<void>;

    // Leaderboard
    get_leaderboard: (period?: RankingPeriod, period_id?: string) => Promise<User[]>;

    // Auth
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
