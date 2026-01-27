import { Event, Fight, Fighter, User, Pick } from '../types';

export type RankingPeriod = 'week' | 'month' | 'year' | 'all';

export interface IDataService {
    // Events
    getEvents(): Promise<Event[]>;
    getEvent(id: string): Promise<Event | null>;
    createEvent(event: Omit<Event, 'id'>): Promise<Event>;
    updateEvent(event: Event): Promise<Event>;
    deleteEvent(id: string): Promise<void>;

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
    updatePick: (pick: Pick) => Promise<void>;

    // Leaderboard
    getLeaderboard: (period?: 'week' | 'month' | 'year' | 'all') => Promise<User[]>;

    // Auth
    login(email: string, password: string): Promise<User | null>;
}
