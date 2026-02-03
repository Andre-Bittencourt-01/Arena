import { Event, Fight, Fighter, User, Pick, League } from '../types';

export type RankingPeriod = 'week' | 'month' | 'year' | 'all';

export interface IDataService {
    // Events
    getEvents(): Promise<Event[]>;
    getEvent(id: string): Promise<Event | null>;
    createEvent(event: Omit<Event, 'id'>): Promise<Event>;
    updateEvent(event: Event): Promise<Event>;
    deleteEvent(id: string): Promise<void>;
    getAdminEvents(): Promise<Event[]>;

    // Fights
    getFights(eventId: string): Promise<Fight[]>;
    createFight(fight: Fight): Promise<Fight>;
    updateFight(fight: Fight): Promise<Fight>;
    deleteFight(id: string): Promise<void>;

    // Fighters
    getFighters(): Promise<Fighter[]>;
    createFighter(fighter: Omit<Fighter, 'id'>): Promise<Fighter>;
    getPicksForEvent: (eventId: string) => Promise<Record<string, Pick>>;

    // Picks Management (Admin)
    getAllPicksForEvent: (eventId: string) => Promise<Pick[]>;
    submitPick: (payload: any) => Promise<void>;
    submitPicksBatch: (picks: any[]) => Promise<void>;

    // Leaderboard
    getLeaderboard: (period?: RankingPeriod, periodId?: string) => Promise<User[]>;

    // Auth
    login(email: string, password: string): Promise<User | null>;
    getMe(): Promise<User | null>;
    getUserById(id: string): Promise<User | null>;

    // Leagues
    getLeagues(): Promise<League[]>;
    createLeague(name: string, owner_id: string, description?: string, logo_url?: string): Promise<League>;
    joinLeague(invite_code: string, user_id: string): Promise<League>;
    getLeaguesForUser(userId: string): Promise<League[]>;
    getLeagueByInviteCode(code: string): Promise<League | null>;
    getLeagueById(id: string): Promise<League | null>;
    updateLeague(id: string, data: { name: string, description: string, logo_url?: string }): Promise<League>;
    deleteLeague(id: string): Promise<void>;
    removeMember(leagueId: string, userId: string): Promise<League>;
    manageAdmin(leagueId: string, user_id: string, action: 'promote' | 'demote'): Promise<League>;
}
