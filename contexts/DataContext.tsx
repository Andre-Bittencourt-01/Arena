import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Event, Fight, Fighter, User, Pick } from '../types';
import { IDataService, RankingPeriod } from '../services/types';
import { MockDataService } from '../services/MockDataService';

interface DataContextType {
    events: Event[];
    currentEvent: Event | null;
    setCurrentEvent: (event: Event | null) => void;
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

    // Picks Management
    getAllPicksForEvent: (eventId: string) => Promise<Pick[]>;
    updatePick: (pick: Pick) => Promise<void>;

    // Leaderboard
    leaderboard: User[];
    rankingFilter: RankingPeriod;
    setRankingFilter: (period: RankingPeriod) => void;
    selectedPeriodId: string | null;
    setSelectedPeriodId: (id: string | null) => void;
    getLeaderboard: (period: RankingPeriod, periodId?: string) => Promise<User[]>;

    // Auth
    user: User | null;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Singleton service instance
const dataService: IDataService = new MockDataService();

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [events, setEvents] = useState<Event[]>([]);
    const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
    const [currentFights, setCurrentFights] = useState<Fight[]>([]);
    const [fighters, setFighters] = useState<Fighter[]>([]);
    const [leaderboard, setLeaderboard] = useState<User[]>([]);
    const [rankingFilter, setRankingFilter] = useState<RankingPeriod>('week');
    const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    const refreshData = useCallback(async () => {
        setLoading(true);
        try {
            const [fetchedEvents, fetchedFighters] = await Promise.all([
                dataService.getEvents(),
                dataService.getFighters()
            ]);
            setEvents(fetchedEvents);
            setFighters(fetchedFighters);

            // Fetch leaderboard with stable dependencies
            const fetchedLeaderboard = await dataService.getLeaderboard(rankingFilter, selectedPeriodId || undefined);
            setLeaderboard(fetchedLeaderboard);

            if (currentEvent) {
                const refreshedEvent = await dataService.getEvent(currentEvent.id);
                if (refreshedEvent) setCurrentEvent(refreshedEvent);

                const fights = await dataService.getFights(currentEvent.id);
                setCurrentFights(fights);
            } else if (fetchedEvents.length > 0) {
                // Default to first event if none selected
                const firstEvent = fetchedEvents[0];
                setCurrentEvent(firstEvent);
                const fights = await dataService.getFights(firstEvent.id);
                setCurrentFights(fights);
            }

            if (user) {
                const updatedUser = await dataService.getUser(user.id);
                if (updatedUser) setUser(updatedUser);
            }
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    }, [rankingFilter, selectedPeriodId, currentEvent, user]); // Added dependencies to refresh correctly

    useEffect(() => {
        setSelectedPeriodId(null); // Reset specific period when switching filters
        refreshData();
    }, [rankingFilter]); // Refresh when filter changes

    useEffect(() => {
        const fetchFights = async () => {
            if (currentEvent) {
                const fights = await dataService.getFights(currentEvent.id);
                setCurrentFights(fights);
            }
        };
        fetchFights();
    }, [currentEvent]);

    useEffect(() => {
        refreshData();
    }, [selectedPeriodId]);

    // Auth
    const login = useCallback(async (email: string, password: string) => {
        const loggedUser = await dataService.login(email, password);
        if (loggedUser) {
            setUser(loggedUser);
            return true;
        }
        return false;
    }, []);

    const logout = useCallback(() => {
        setUser(null);
    }, []);

    const createEvent = useCallback(async (event: Omit<Event, 'id'>) => {
        await dataService.createEvent(event);
        await refreshData();
    }, [refreshData]);

    const updateEvent = useCallback(async (event: Event) => {
        await dataService.updateEvent(event);
        await refreshData();
    }, [refreshData]);

    const deleteEvent = useCallback(async (id: string) => {
        await dataService.deleteEvent(id);
        if (currentEvent && currentEvent.id === id) {
            setCurrentEvent(null);
            setCurrentFights([]);
        }
        await refreshData();
    }, [currentEvent, refreshData]);

    const getFightsForEvent = useCallback(async (eventId: string) => {
        return await dataService.getFights(eventId);
    }, []);

    const createFight = useCallback(async (fight: Fight) => {
        await dataService.createFight(fight);
        if (currentEvent && fight.event_id === currentEvent.id) {
            await refreshData();
        }
    }, [currentEvent, refreshData]);

    const updateFight = useCallback(async (fight: Fight) => {
        await dataService.updateFight(fight);
        if (currentEvent && fight.event_id === currentEvent.id) {
            await refreshData();
        }
    }, [currentEvent, refreshData]);

    const deleteFight = useCallback(async (id: string) => {
        await dataService.deleteFight(id);
        if (currentEvent) {
            await refreshData();
        }
    }, [currentEvent, refreshData]);

    const createFighter = useCallback(async (fighter: Omit<Fighter, 'id'>) => {
        await dataService.createFighter(fighter);
        await refreshData();
    }, [refreshData]);

    const updatePick = useCallback(async (pick: Pick) => {
        await dataService.updatePick(pick);
        await refreshData();
    }, [refreshData]);

    const value = useMemo(() => ({
        events,
        currentEvent,
        setCurrentEvent,
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
        getPicksForEvent: (eventId: string) => dataService.getPicksForEvent(eventId),
        getAllPicksForEvent: (eventId: string) => dataService.getAllPicksForEvent(eventId),
        updatePick,
        leaderboard,
        rankingFilter,
        setRankingFilter,
        selectedPeriodId,
        setSelectedPeriodId,
        user,
        login,
        logout,
        getLeaderboard: (period: RankingPeriod, periodId?: string) => dataService.getLeaderboard(period, periodId)
    }), [
        events, currentEvent, currentFights, loading, refreshData, createEvent,
        updateEvent, deleteEvent, getFightsForEvent, createFight, updateFight,
        deleteFight, fighters, createFighter, updatePick, leaderboard,
        rankingFilter, selectedPeriodId, user, login, logout
    ]);

    return (
        <DataContext.Provider value={value}>
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
