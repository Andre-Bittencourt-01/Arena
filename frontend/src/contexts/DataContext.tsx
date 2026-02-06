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
    reorder_fights: (orders: { id: string, order: number }[]) => Promise<void>;

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
    const { user } = useAuth(); // Fix: use 'user' instead of 'token' which doesn't exist on context
    const [events, set_events] = useState<Event[]>([]);
    const [current_event, set_current_event] = useState<Event | null>(null);
    const [current_fights, set_current_fights] = useState<Fight[]>([]);
    const [fighters, set_fighters] = useState<Fighter[]>([]);
    const [leaderboard, set_leaderboard] = useState<User[]>([]);
    const [loading, set_loading] = useState(true);
    const [ranking_filter, set_ranking_filter] = useState<RankingPeriod>('ALL_TIME');
    const [selected_period_id, set_selected_period_id] = useState<string | null>(null);

    const refresh_data = useCallback(async (retry_count = 0) => {
        set_loading(true);
        try {
            const events_data = await data_service.get_events();
            console.log('[DataContext] Loaded events:', events_data);
            set_events(events_data);

            if (events_data.length > 0) {
                // Backend may return uppercase/lowercase mismatch vs Types
                // We normalize checks here using (status as string)
                const upcoming = events_data.find(e => {
                    const s = (e.status as string || '').toUpperCase();
                    return s === 'UPCOMING' || s === 'SCHEDULED' || s === 'OPEN';
                });
                const last_completed = [...events_data].reverse().find(e => {
                    const s = (e.status as string || '').toUpperCase();
                    return s === 'COMPLETED' || s === 'FINISHED';
                });

                const initial_event = upcoming || last_completed || events_data[0];
                console.log('[DataContext] Selected initial event:', initial_event);
                set_current_event(initial_event);

                // Note: Polling logic moved to dedicated useEffect monitoring `current_event?.is_calculating_points`
            } else {
                // Auto-Revalidation: If events list is empty (cold start?), try once more
                if (retry_count === 0) {
                    console.warn('[DataContext] Events list is empty. Auto-revalidating in 3s...');
                    setTimeout(() => refresh_data(1), 3000);
                }
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // Auto-Retry Logic for Initial Load
            if (retry_count < 3) {
                console.warn(`[DataContext] Retrying refresh in 2s... (${retry_count + 1}/3)`);
                setTimeout(() => refresh_data(retry_count + 1), 2000);
            }
        } finally {
            set_loading(false);
        }
    }, []);

    // Reactive Polling for Calculation Lock
    useEffect(() => {
        let interval_id: NodeJS.Timeout;

        if (current_event && current_event.is_calculating_points) {
            console.warn('[DataContext] 🔒 Calculation in progress. Starting fast poll...');

            interval_id = setInterval(async () => {
                try {
                    // Fetch only the specific event to save bandwidth
                    const updated_event = await data_service.get_event(current_event.id);

                    if (updated_event && !updated_event.is_calculating_points) {
                        console.log('[DataContext] 🔓 Calculation finished! Refreshing Leaderboard...');

                        // 1. Update Current Event State
                        set_current_event(prev => updated_event);

                        // 2. Update Events List State
                        set_events(prev => prev.map(e => e.id === updated_event.id ? updated_event : e));

                        // 3. Trigger Leaderboard Refresh
                        get_leaderboard(ranking_filter, selected_period_id || undefined);

                        // Stop polling
                        clearInterval(interval_id);
                    }
                } catch (err) {
                    console.error('Polling error:', err);
                }
            }, 3000); // 3 seconds interval
        }

        return () => {
            if (interval_id) clearInterval(interval_id);
        };
    }, [current_event?.id, current_event?.is_calculating_points, ranking_filter, selected_period_id]);

    // Session Management: Reset/Refresh on User Change
    useEffect(() => {
        if (user) {
            console.log('[DataContext] User Logged In/Changed. Refreshing Data...');
            refresh_data();
        } else {
            console.log('[DataContext] User Logged Out. Clearing Data...');
            // Optional: Clear sensitive data if strictly required, 
            // but keeping events/fights (public data) is usually better UX than blank screen.
            // If we must clean per prompt:
            // set_events([]); 
            // set_current_event(null);
            // set_current_fights([]);
            // For now, assume keeping public data is fine, but re-fetching ensures no "user-specific" pollution.
        }
    }, [user, refresh_data]);

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

    // Initial Load (Deprecated by User Effect, but kept for Guest Mode support if needed)
    useEffect(() => {
        // Only trigger if no user is present (Guest), otherwise user effect handles it
        if (!user) {
            const timer = setTimeout(() => {
                refresh_data();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [refresh_data, user === null]);

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
                const res = await data_service.create_event(event_data); // 1. Capture result
                await refresh_data(); // 2. Refresh list
                return res; // 3. RETURN THE OBJECT (Critical!)
            } catch (error) {
                console.error("Create Event Failed:", error);
                throw error;
            }
        },
        update_event: (event) => data_service.update_event(event),
        delete_event: async (id) => {
            await data_service.delete_event(id);
            await refresh_data();
        },
        get_event: (id) => data_service.get_event(id),
        get_admin_events: async () => {
            const evts = await data_service.get_admin_events();
            set_events(evts);
        },

        // Fights
        get_fights_for_event: (event_id) => data_service.get_fights(event_id),
        create_fight: async (fight_data) => {
            try {
                const res = await data_service.create_fight(fight_data); // 1. Capture result

                // Refresh logic (keep existing behavior)
                if (current_event && fight_data.event_id === current_event.id) {
                    const fights = await data_service.get_fights(current_event.id);
                    set_current_fights(fights);
                }
                return res; // 2. RETURN THE OBJECT
            } catch (error) {
                console.error("Create Fight Failed:", error);
                throw error;
            }
        },
        update_fight: (fight) => data_service.update_fight(fight),
        delete_fight: (id) => data_service.delete_fight(id),
        reorder_fights: (orders) => data_service.reorder_fights(orders),

        // Fighters
        create_fighter: async (fighter_data) => {
            // Direct return is fine here as it doesn't need global refresh
            return await data_service.create_fighter(fighter_data);
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
