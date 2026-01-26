import { Event, Fight, Fighter } from '../types';

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
    getPicks(eventId: string): Promise<Record<string, Pick>>;
}
