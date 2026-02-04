import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Event, Fight, Fighter, User, Pick, League, IDataService, RankingPeriod } from '../types';
import { ApiDataService } from '../services/ApiDataService';
import { MockDataService } from '../services/MockDataService';
import { useAuth } from './AuthContext';

interface DataContextType {
    events: Event[];
    current_event: Event | null;
    set_current_event: (event: Event | null) => void;
    current_fights: Fight[];
    loading: boolean;
    refresh_data: () => Promise<void>;

    // Events
    create_event: (event: Omit<Event, 'id'>) => Promise<Event>;
    update_event: (event: Event) => Promise<Event>;
    delete_event: (id: string) => Promise<void>;
    get_event: (id: string) => Promise<Event | null>;
    get_admin_events: () => Promise<void>;

    // Fights
    get_fights_for_event: (event_id: string) => Promise<Fight[]>;
    create_fight: (fight: Fight) => Promise<Fight>;
    update_fight: (fight: Fight) => Promise<Fight>;
    delete_fight: (id: string) => Promise<void>;

    // Fighters
    fighters: Fighter[];
    create_fighter: (fighter: Omit<Fighter, 'id'>) => Promise<Fighter>;
    get_picks_for_event: (event_id: string) => Promise<Record<string, Pick>>;

    // Picks Management
    get_all_picks_for_event: (event_id: string) => Promise<Pick[]>;
    submit_pick: (payload: any) => Promise<void>;
    submit_picks_batch: (picks: any[]) => Promise<void>;

    // Leaderboard
    leaderboard: User[];
    ranking_filter: RankingPeriod;
    set_ranking_filter: (period: RankingPeriod) => void;
    selected_period_id: string | null;
    set_selected_period_id: (id: string | null) => void;
    get_leaderboard: (period: RankingPeriod, period_id?: string) => Promise<User[]>;

    get_me: () => Promise<User | null>;

    // Leagues
    create_league: (name: string, owner_id: string, description?: string, logo_url?: string) => Promise<League>;
    join_league: (invite_code: string, user_id: string) => Promise<League>;
    get_leagues_for_user: (user_id: string) => Promise<League[]>;
    get_league_by_invite_code: (code: string) => Promise<League | null>;
    get_league_by_id: (id: string) => Promise<League | null>;
    update_league: (id: string, data: { name: string, description: string, logo_url?: string }) => Promise<League>;
    delete_league: (id: string) => Promise<void>;
    remove_member: (league_id: string, user_id: string) => Promise<League>;
    manage_admin: (league_id: string, user_id: string, action: 'promote' | 'demote') => Promise<League>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const data_service: IDataService = new ApiDataService();

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { token } = useAuth();
    const [events, set_events] = useState<Event[]>([]);
    const [current_event, set_current_event] = useState<Event | null>(null);
    const [current_fights, set_current_fights] = useState<Fight[]>([]);
    const [fighters, set_fighters] = useState<Fighter[]>([]);
    const [leaderboard, set_leaderboard] = useState<User[]>([]);
    const [loading, set_loading] = useState(true);
    const [ranking_filter, set_ranking_filter] = useState<RankingPeriod>('ALL_TIME');
    const [selected_period_id, set_selected_period_id] = useState<string | null>(null);

    const refresh_data = useCallback(async () => {
        set_loading(true);
        try {
            const events_data = await data_service.get_events();
            set_events(events_data);

            if (events_data.length > 0) {
                const upcoming = events_data.find(e => e.status === 'upcoming');
                const last_completed = [...events_data].reverse().find(e => e.status === 'completed');
                const initial_event = upcoming || last_completed || events_data[0];
                set_current_event(initial_event);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            set_loading(false);
        }
    }, []);

    useEffect(() => {
        const load_fights = async () => {
            if (current_event) {
                try {
                    const fights_data = await data_service.get_fights(current_event.id);
                    set_current_fights(fights_data);
                } catch (error) {
                    console.error('Error fetching fights:', error);
                }
            }
        };
        load_fights();
    }, [current_event]);

    useEffect(() => {
        refresh_data();
    }, [refresh_data]);

    const value: DataContextType = {
        events,
        current_event,
        set_current_event,
        current_fights,
        loading,
        refresh_data,
        fighters,
        ranking_filter,
        set_ranking_filter,
        selected_period_id,
        set_selected_period_id,

        // Events
        create_event: async (event_data) => {
            try {
                const res = await data_service.create_event(event_data);
                await refresh_data();
                return res;
            } catch (error) {
                console.error("Create Event Failed:", error);
                throw error;
            }
        },
        update_event: (event) => data_service.update_event(event),
        delete_event: (id) => data_service.delete_event(id),
        get_event: (id) => data_service.get_event(id),
        get_admin_events: async () => {
            const evts = await data_service.get_admin_events();
            set_events(evts);
        },

        // Fights
        get_fights_for_event: (event_id) => data_service.get_fights(event_id),
        create_fight: async (fight) => {
            const res = await data_service.create_fight(fight);
            if (current_event && fight.event_id === current_event.id) {
                const fights = await data_service.get_fights(current_event.id);
                set_current_fights(fights);
            }
            return res;
        },
        update_fight: (fight) => data_service.update_fight(fight),
        delete_fight: (id) => data_service.delete_fight(id),

        // Fighters
        create_fighter: async (fighter_data) => {
            const res = await data_service.create_fighter(fighter_data);
            return res;
        },
        get_picks_for_event: (event_id) => data_service.get_picks_for_event(event_id),

        // Picks Management
        get_all_picks_for_event: (event_id) => data_service.get_all_picks_for_event(event_id),
        submit_pick: async (pick_data) => {
            return await data_service.submit_pick(pick_data);
        },
        submit_picks_batch: (picks) => data_service.submit_picks_batch(picks),

        // Leaderboard
        get_leaderboard: async (period, period_id) => {
            const lb = await data_service.get_leaderboard(period, period_id);
            set_leaderboard(lb);
            return lb;
        },
        leaderboard,

        get_me: () => data_service.get_me(),

        // Leagues
        create_league: (name, owner_id, description, logo_url) => data_service.create_league(name, owner_id, description, logo_url),
        join_league: (invite_code, user_id) => data_service.join_league(invite_code, user_id),
        get_leagues_for_user: (user_id) => data_service.get_leagues_for_user(user_id),
        get_league_by_invite_code: (code) => data_service.get_league_by_invite_code(code),
        get_league_by_id: (id) => data_service.get_league_by_id(id),
        update_league: (id, data) => data_service.update_league(id, data),
        delete_league: (id) => data_service.delete_league(id),
        remove_member: (league_id, user_id) => data_service.remove_member(league_id, user_id),
        manage_admin: (league_id, user_id, action) => data_service.manage_admin(league_id, user_id, action)
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
