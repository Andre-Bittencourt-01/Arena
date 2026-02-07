import { IDataService, RankingPeriod } from '../types'; // Import from the NEW unified types
import type { Event, Fight, Fighter, User, Pick, League } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';

export class ApiDataService implements IDataService {
    private getHeaders() {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        };
    }

    private async fetch<T>(endpoint: string, options?: RequestInit, retries = 3): Promise<T> {
        try {
            const res = await fetch(`${API_URL}${endpoint}`, {
                ...options,
                headers: {
                    ...this.getHeaders(),
                    ...options?.headers
                }
            });

            if (!res.ok) {
                if (res.status === 401) {
                    console.warn('[API] 401 Unauthorized - Dispatching Session Expired Event');
                    window.dispatchEvent(new Event('auth:session_expired'));
                }
                const errorBody = await res.text();
                throw new Error(`API Error ${res.status}: ${errorBody}`);
            }

            // ZERO-TRANSLATION: Return raw JSON directly
            // The Backend JSON MUST match the Frontend Interfaces (snake_case)
            const text = await res.text();
            return text ? JSON.parse(text) : null;

        } catch (error: any) {
            // Se for erro de rede (refused, timeout, offline) e ainda tiver tentativas
            if (retries > 0 && (error instanceof TypeError || error.name === 'TypeError')) {
                console.warn(`[API Connectivity] Tentando reconectar a ${endpoint}... (${retries} tentativas restantes)`);
                await new Promise(resolve => setTimeout(resolve, 1500));
                return this.fetch(endpoint, options, retries - 1);
            }
            throw error;
        }
    }

    // --- EVENTS ---
    async get_events(): Promise<Event[]> {
        return this.fetch<Event[]>('/events');
    }

    async get_event(id: string): Promise<Event | null> {
        return this.fetch<Event>(`/events/${id}`);
    }

    async get_upcoming_events(): Promise<Event[]> {
        return this.fetch<Event[]>('/events/upcoming');
    }

    async get_admin_events(): Promise<Event[]> {
        return this.fetch<Event[]>('/admin/events');
    }

    async create_event(event: Omit<Event, 'id'>): Promise<Event> {
        return this.fetch<Event>('/admin/events', {
            method: 'POST',
            body: JSON.stringify(event)
        });
    }

    async update_event(event: Event): Promise<Event> {
        return this.fetch<Event>(`/admin/events/${event.id}`, {
            method: 'PUT',
            body: JSON.stringify(event)
        });
    }

    async delete_event(id: string): Promise<void> {
        return this.fetch<void>(`/admin/events/${id}`, {
            method: 'DELETE',
            body: JSON.stringify({})
        });
    }

    // --- FIGHTS ---
    async get_fights(event_id: string): Promise<Fight[]> {
        return this.fetch<Fight[]>(`/events/${event_id}/fights`);
    }

    async create_fight(fight: Fight): Promise<Fight> {
        return this.fetch<Fight>('/admin/fights', {
            method: 'POST',
            body: JSON.stringify(fight)
        });
    }

    async update_fight(fight: Fight): Promise<Fight> {
        return this.fetch<Fight>(`/admin/fights/${fight.id}`, {
            method: 'PUT',
            body: JSON.stringify(fight)
        });
    }

    async delete_fight(id: string): Promise<void> {
        return this.fetch<void>(`/admin/fights/${id}`, {
            method: 'DELETE',
            body: JSON.stringify({})
        });
    }

    async reorder_fights(orders: { id: string, order: number }[]): Promise<void> {
        console.log('[API] Enviando reordenação em lote...', orders);
        return this.fetch<void>('/admin/fights/reorder', {
            method: 'PATCH',
            body: JSON.stringify({ orders })
        });
    }

    // --- FIGHTERS ---
    async get_fighters(): Promise<Fighter[]> {
        return this.fetch<Fighter[]>('/fighters');
    }

    async create_fighter(fighter: Omit<Fighter, 'id'>): Promise<Fighter> {
        return this.fetch<Fighter>('/admin/fighters', {
            method: 'POST',
            body: JSON.stringify(fighter)
        });
    }

    // --- PICKS ---
    async get_picks_for_event(event_id: string): Promise<Record<string, Pick>> {
        // Returns Array, converts to Record for O(1) lookup
        const picksList = await this.fetch<Pick[]>(`/events/${event_id}/my-picks`);
        const picksMap: Record<string, Pick> = {};
        if (Array.isArray(picksList)) {
            picksList.forEach(p => { picksMap[p.fight_id] = p; });
        }
        return picksMap;
    }

    async get_all_picks_for_event(event_id: string): Promise<Pick[]> {
        return this.fetch<Pick[]>(`/admin/events/${event_id}/picks`);
    }

    async submit_pick(payload: any): Promise<void> {
        return this.fetch<void>('/picks', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }

    async submit_picks_batch(picks: any[]): Promise<void> {
        return this.fetch<void>('/picks/batch', {
            method: 'POST',
            body: JSON.stringify({ picks })
        });
    }

    // --- LEADERBOARD & USERS ---
    async get_leaderboard(period?: RankingPeriod, period_id?: string): Promise<User[]> {
        let url = `/leagues/global-league/leaderboard`;

        let safe_id = period_id || '';

        // Backend Crash Prevention: Ensure Year is only 4 chars
        if (period === 'year' && safe_id.length > 4) {
            safe_id = safe_id.substring(0, 4);
        }

        if (period === 'week') url += `?eventId=${safe_id}`;
        else if (period === 'month') url += `?month=${safe_id}`;
        else if (period === 'year') url += `?year=${safe_id}`;

        console.log(`[API] Fetching Leaderboard: ${url}`);
        return this.fetch<User[]>(url);
    }

    async login(email: string, password: string): Promise<User | null> {
        const res = await this.fetch<{ token: string, user: User }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        if (res?.token) {
            localStorage.setItem('token', res.token);
            return res.user;
        }
        return null;
    }

    async get_me(): Promise<User | null> {
        return this.fetch<User>('/auth/me');
    }

    async get_user_by_id(id: string): Promise<User | null> {
        return this.fetch<User>(`/users/${id}`);
    }

    // --- LEAGUES ---
    async get_leagues(): Promise<League[]> {
        return this.fetch<League[]>('/leagues');
    }

    async create_league(name: string, owner_id: string, description?: string, logo_url?: string): Promise<League> {
        return this.fetch<League>('/leagues', {
            method: 'POST',
            body: JSON.stringify({ name, owner_id, description, logo_url })
        });
    }

    async join_league(invite_code: string, user_id: string): Promise<League> {
        return this.fetch<League>('/leagues/join', {
            method: 'POST',
            body: JSON.stringify({ invite_code, user_id })
        });
    }

    async get_leagues_for_user(user_id: string): Promise<League[]> {
        return this.fetch<League[]>(`/users/${user_id}/leagues`);
    }

    async get_league_by_invite_code(code: string): Promise<League | null> {
        return this.fetch<League>(`/leagues/invite/${code}`);
    }

    async get_league_by_id(id: string): Promise<League | null> {
        return this.fetch<League>(`/leagues/${id}`);
    }

    async update_league(id: string, data: { name: string, description: string, logo_url?: string }): Promise<League> {
        return this.fetch<League>(`/leagues/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async delete_league(id: string): Promise<void> {
        return this.fetch<void>(`/leagues/${id}`, {
            method: 'DELETE',
            body: JSON.stringify({})
        });
    }

    async remove_member(league_id: string, user_id: string): Promise<League> {
        return this.fetch<League>(`/leagues/${league_id}/members/${user_id}`, {
            method: 'DELETE',
            body: JSON.stringify({})
        });
    }

    async manage_admin(league_id: string, user_id: string, action: 'promote' | 'demote'): Promise<League> {
        return this.fetch<League>(`/leagues/${league_id}/admins`, {
            method: 'PATCH',
            body: JSON.stringify({ user_id, action })
        });
    }
}
