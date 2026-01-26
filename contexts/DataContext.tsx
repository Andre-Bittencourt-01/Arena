import React, { createContext, useContext, useState, useEffect } from 'react';
import { Event, Fight, Fighter } from '../types';
import { IDataService } from '../services/types';
import { MockDataService } from '../services/MockDataService';

interface DataContextType {
    events: Event[];
    currentEvent: Event | null;
    currentFights: Fight[];
    loading: boolean;
    refreshData: () => Promise<void>;

    // Events
    createEvent: (event: Omit<Event, 'id'>) => Promise<void>;
    updateEvent: (event: Event) => Promise<void>;
    deleteEvent: (id: string) => Promise<void>;
    getEvent: (id: string) => Promise<Event | null>;

    // Fights
    getFightsForEvent: (eventId: string) => Promise<Fight[]>;
    createFight: (fight: Fight) => Promise<void>;
    updateFight: (fight: Fight) => Promise<void>;
    deleteFight: (id: string) => Promise<void>;

    // Fighters
    fighters: Fighter[];
    createFighter: (fighter: Omit<Fighter, 'id'>) => Promise<void>;
    getPicksForEvent: (eventId: string) => Promise<Record<string, Pick>>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Singleton service instance
const dataService: IDataService = new MockDataService();

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [events, setEvents] = useState<Event[]>([]);
    const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
    const [currentFights, setCurrentFights] = useState<Fight[]>([]);
    const [fighters, setFighters] = useState<Fighter[]>([]);
    const [loading, setLoading] = useState(true);

    const refreshData = async () => {
        setLoading(true);
        try {
            const fetchedEvents = await dataService.getEvents();
            const fetchedFighters = await dataService.getFighters();
            setEvents(fetchedEvents);
            setFighters(fetchedFighters);

            // Default to first event if none selected
            if (!currentEvent && fetchedEvents.length > 0) {
                const firstEvent = fetchedEvents[0];
                setCurrentEvent(firstEvent);
                const fights = await dataService.getFights(firstEvent.id);
                setCurrentFights(fights);
            } else if (currentEvent) {
                // Refresh current event fights
                const fights = await dataService.getFights(currentEvent.id);
                setCurrentFights(fights);
            }
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshData();
    }, []);

    // Events
    const createEvent = async (event: Omit<Event, 'id'>) => {
        await dataService.createEvent(event);
        await refreshData();
    };

    const updateEvent = async (event: Event) => {
        await dataService.updateEvent(event);
        await refreshData();
    };

    const deleteEvent = async (id: string) => {
        await dataService.deleteEvent(id);
        if (currentEvent && currentEvent.id === id) {
            setCurrentEvent(null);
            setCurrentFights([]);
        }
        await refreshData();
    };

    // Fights
    const getFightsForEvent = async (eventId: string) => {
        return await dataService.getFights(eventId);
    };

    const createFight = async (fight: Fight) => {
        await dataService.createFight(fight);
        if (currentEvent && fight.event_id === currentEvent.id) {
            await refreshData();
        }
    };

    const updateFight = async (fight: Fight) => {
        await dataService.updateFight(fight);
        if (currentEvent && fight.event_id === currentEvent.id) {
            await refreshData();
        }
    };

    const deleteFight = async (id: string) => {
        await dataService.deleteFight(id);
        if (currentEvent) {
            await refreshData();
        }
    };

    // Fighters
    const createFighter = async (fighter: Omit<Fighter, 'id'>) => {
        await dataService.createFighter(fighter);
        await refreshData();
    };

    return (
        <DataContext.Provider value={{
            events,
            currentEvent,
            currentFights,
            loading,
            refreshData,
            createEvent,
            updateEvent,
            deleteEvent,
            getEvent: (id: string) => dataService.getEvent(id),
            getFightsForEvent,
            createFight,
            updateFight,
            deleteFight,
            fighters,
            createFighter,
            getPicksForEvent: (eventId: string) => dataService.getPicks(eventId)
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
