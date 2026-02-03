import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Event, Fight, Fighter, User, Pick, League } from '../types';

import { IDataService, RankingPeriod } from '../services/types';
import { MockDataService } from '../services/MockDataService';
import { ApiDataService } from '../services/ApiDataService';
import { useAuth } from './AuthContext';

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
    getAdminEvents: () => Promise<void>;

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
    submitPick: (payload: any) => Promise<void>;
    submitPicksBatch: (picks: any[]) => Promise<void>;

    // Leaderboard
    leaderboard: User[];
    rankingFilter: RankingPeriod;
    setRankingFilter: (period: RankingPeriod) => void;
    selectedPeriodId: string | null;
    setSelectedPeriodId: (id: string | null) => void;
    getLeaderboard: (period: RankingPeriod, periodId?: string) => Promise<User[]>;

    // Auth (Retired here, use AuthContext)
    // user: User | null;
    // login: (email: string, password: string) => Promise<boolean>;
    // logout: () => void;
    getMe: () => Promise<User | null>;

    // Leagues

    createLeague: (name: string, ownerId: string, description?: string, logoUrl?: string) => Promise<League>;
    joinLeague: (inviteCode: string, userId: string) => Promise<League>;
    getLeaguesForUser: (userId: string) => Promise<League[]>;
    getLeagueByInviteCode: (code: string) => Promise<League | null>;
    getLeagueById: (id: string) => Promise<League | null>;
    updateLeague: (id: string, data: { name: string, description: string, logo_url?: string }) => Promise<League>;
    deleteLeague: (id: string) => Promise<void>;
    removeMember: (leagueId: string, userId: string) => Promise<League>;
    manageAdmin: (leagueId: string, userId: string, action: 'promote' | 'demote') => Promise<League>;
}


const DataContext = createContext<DataContextType | undefined>(undefined);

// Singleton service instance
const dataService: IDataService = new ApiDataService();

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [events, setEvents] = useState<Event[]>([]);
    const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
    const [currentFights, setCurrentFights] = useState<Fight[]>([]);
    const [fighters, setFighters] = useState<Fighter[]>([]);
    const [leaderboard, setLeaderboard] = useState<User[]>([]);
    const [rankingFilter, setRankingFilter] = useState<RankingPeriod>('month');
    const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const { user, loading: authLoading } = useAuth();

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

            // User refresh would happen in AuthContext now, but for data consistency:
            // if (user) {
            //     const updatedUser = await dataService.getMe();
            //     if (updatedUser) setUser(updatedUser);
            // }
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    }, [rankingFilter, selectedPeriodId, currentEvent]); // Removed user dependency

    useEffect(() => {
        if (authLoading) return;
        setSelectedPeriodId(null); // Reset specific period when switching filters
        refreshData();
    }, [rankingFilter, authLoading, user]); // Refresh when filter changes or auth state changes

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
        if (authLoading) return;
        refreshData();
    }, [selectedPeriodId, authLoading, user]);

    // Auth retired from here

    const createEvent = useCallback(async (event: Omit<Event, 'id'>) => {
        await dataService.createEvent(event);
        await refreshData();
    }, [refreshData]);

    const getAdminEvents = useCallback(async () => {
        setLoading(true);
        try {
            const fetchedEvents = await dataService.getAdminEvents();
            setEvents(fetchedEvents);
        } catch (error) {
            console.error("Failed to fetch admin events", error);
        } finally {
            setLoading(false);
        }
    }, []);

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

    const submitPick = useCallback(async (payload: any) => {
        await dataService.submitPick(payload);
        await refreshData();
    }, [refreshData]);

    const submitPicksBatch = useCallback(async (picks: any[]) => {
        setLoading(true);
        try {
            await dataService.submitPicksBatch(picks);
            await refreshData();
        } finally {
            setLoading(false);
        }
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
        getAdminEvents,
        getFightsForEvent,
        createFight,
        updateFight,
        deleteFight,
        fighters,
        createFighter,
        getPicksForEvent: (eventId: string) => dataService.getPicksForEvent(eventId),
        getAllPicksForEvent: (eventId: string) => dataService.getAllPicksForEvent(eventId),
        submitPick,
        submitPicksBatch,
        leaderboard,
        rankingFilter,
        setRankingFilter,
        selectedPeriodId,
        setSelectedPeriodId,
        getMe: () => dataService.getMe(),
        getUserById: (id: string) => dataService.getUserById(id),
        getLeaderboard: (period: RankingPeriod, periodId?: string) => dataService.getLeaderboard(period, periodId),


        // Leagues
        createLeague: (name: string, ownerId: string, description?: string, logoUrl?: string) => dataService.createLeague(name, ownerId, description, logoUrl),
        joinLeague: (inviteCode: string, userId: string) => dataService.joinLeague(inviteCode, userId),
        getLeaguesForUser: (userId: string) => dataService.getLeaguesForUser(userId),
        getLeagueByInviteCode: (code: string) => dataService.getLeagueByInviteCode(code),
        getLeagueById: (id: string) => dataService.getLeagueById(id),
        updateLeague: (id: string, data: { name: string, description: string, logo_url?: string }) => dataService.updateLeague(id, data),
        deleteLeague: (id: string) => dataService.deleteLeague(id),
        removeMember: (leagueId: string, userId: string) => dataService.removeMember(leagueId, userId),
        manageAdmin: (leagueId: string, userId: string, action: 'promote' | 'demote') => dataService.manageAdmin(leagueId, userId, action)
    }), [

        events, currentEvent, currentFights, loading, refreshData, createEvent,
        updateEvent, deleteEvent, getFightsForEvent, createFight, updateFight,
        deleteFight, fighters, createFighter, submitPick, leaderboard,
        rankingFilter, selectedPeriodId, getAdminEvents
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
