import api from './api';
import { IDataService, RankingPeriod } from './types';
import { Event, Fight, Fighter, User, Pick, League, UserDTO, LeagueDTO, PickDTO } from '../types';
import { mapUserDTOToDomain, mapLeagueDTOToDomain, mapPickDTOToDomain } from './adapters';

// Helper Adapter
const adaptFightData = (fight: any) => ({
    ...fight,
    // Garante compatibilidade de IDs
    id: fight.id,
    fighter_a_id: fight.fighterAId || fight.fighter_a_id,
    fighter_b_id: fight.fighterBId || fight.fighter_b_id,
    event_id: fight.eventId || fight.event_id,

    // --- CORREÇÃO: Campos de Resultado ---
    winner_id: fight.winnerId || fight.winner_id,
    round_end: fight.roundEnd || fight.round_end,
    method: fight.method,
    result: fight.result,
    time: fight.time,

    // Objetos Aninhados
    fighter_a: fight.fighterA || fight.fighter_a,
    fighter_b: fight.fighterB || fight.fighter_b,
    winner: fight.winner // Objeto do vencedor
});

export class ApiDataService implements IDataService {
    // Events
    async getEvents(): Promise<Event[]> {
        console.log("📡 [API] Buscando todos os eventos em /events...");
        // Muda de '/events/upcoming' para '/events' para alimentar as abas de Passados/Futuros
        const response = await api.get('/events');
        return response.data;
    }

    async getAdminEvents(): Promise<Event[]> {
        const response = await api.get('/admin/events');
        return response.data;
    }

    async getEvent(id: string): Promise<Event | null> {
        // Fallback to searching in upcoming if no specific getEvent endpoint
        const events = await this.getEvents();
        return events.find(e => e.id === id) || null;
    }

    async createEvent(event: Omit<Event, 'id'>): Promise<Event> {
        try {
            const payload = {
                ...event,
                date: this.ensureISOString(event.date),
                end_date: this.ensureISOString(event.end_date),
                lock_time: this.ensureISOString(event.lock_time),
                cascade_start_time: this.ensureISOString(event.cascade_start_time),
            };

            const response = await api.post('/admin/events', payload, {
                headers: { 'x-admin-secret': 'arena-mma-secret-2025' }
            });
            return response.data;
        } catch (error: any) {
            console.error("🚨 [API] Erro ao criar evento:", error.response?.data || error.message);
            throw error;
        }
    }

    async updateEvent(event: Event): Promise<Event> {
        try {
            const payload = {
                ...event,
                date: this.ensureISOString(event.date),
                end_date: this.ensureISOString(event.end_date),
                lock_time: this.ensureISOString(event.lock_time),
                cascade_start_time: this.ensureISOString(event.cascade_start_time),
            };

            const response = await api.put(`/admin/events/${event.id}`, payload, {
                headers: { 'x-admin-secret': 'arena-mma-secret-2025' }
            });
            return response.data;
        } catch (error: any) {
            console.error("🚨 [API] Erro ao atualizar evento:", error.response?.data || error.message);
            throw error;
        }
    }

    private ensureISOString(val: any): string | undefined {
        if (!val) return undefined;
        if (val instanceof Date) return val.toISOString();
        if (typeof val === 'string') {
            const d = new Date(val);
            return isNaN(d.getTime()) ? val : d.toISOString();
        }
        return val;
    }

    async deleteEvent(id: string): Promise<void> {
        await api.delete(`/admin/events/${id}`, {
            headers: { 'x-admin-secret': 'arena-mma-secret-2025' }
        });
    }

    // Fights
    async getFightsForEvent(eventId: string): Promise<Fight[]> {
        const response = await api.get(`/events/${eventId}/fights`);
        return (response.data || []).map(adaptFightData);
    }

    async getFights(eventId: string): Promise<Fight[]> {
        return this.getFightsForEvent(eventId);
    }

    async createFight(fight: Fight): Promise<Fight> {
        const response = await api.post('/admin/fights', fight, {
            headers: { 'x-admin-secret': 'arena-mma-secret-2025' }
        });
        return adaptFightData(response.data);
    }

    async updateFight(fight: Fight): Promise<Fight> {
        // Envia para o backend (O adapter que criamos antes vai rodar na volta/leitura e no retorno do endpoint)
        const response = await api.put(`/admin/fights/${fight.id}`, fight, {
            headers: { 'x-admin-secret': 'arena-mma-secret-2025' }
        });
        return adaptFightData(response.data);
    }

    async deleteFight(id: string): Promise<void> {
        await api.delete(`/admin/fights/${id}`, {
            headers: { 'x-admin-secret': 'arena-mma-secret-2025' }
        });
    }

    // Fighters
    async getFighters(): Promise<Fighter[]> {
        const response = await api.get('/admin/fighters');
        return response.data;
    }

    async createFighter(fighter: Omit<Fighter, 'id'>): Promise<Fighter> {
        const response = await api.post('/admin/fighters', fighter, {
            headers: { 'x-admin-secret': 'arena-mma-secret-2025' }
        });
        return response.data;
    }

    async getPicksForEvent(eventId: string): Promise<Record<string, Pick>> {
        const response = await api.get(`/events/${eventId}/my-picks`);
        // Assuming response is an array of picks, convert to Record<fight_id, Pick>
        const picksArray: PickDTO[] = response.data || [];
        const picksRecord: Record<string, Pick> = {};
        picksArray.forEach(dto => {
            const pick = mapPickDTOToDomain(dto);
            picksRecord[pick.fightId] = pick;
        });
        return picksRecord;
    }

    // Picks Management (Admin)
    async getAllPicksForEvent(eventId: string): Promise<Pick[]> {
        const response = await api.get(`/admin/events/${eventId}/picks`, {
            headers: {
                'x-admin-secret': 'arena-mma-secret-2025'
            }
        });
        const data = response.data || [];
        return (data as PickDTO[]).map(mapPickDTOToDomain);
    }

    async submitPick(data: any): Promise<void> {
        console.log('🚀 [DEBUG] Enviando palpite (Borda Snake Case):', data);
        await api.post('/picks', data);
    }

    async submitPicksBatch(picks: any[]): Promise<void> {
        console.log('🚀 [DEBUG] Enviando lote final:', picks.length);
        await api.post('/picks/batch', { picks });
    }

    // Leaderboard
    async getLeaderboard(period?: RankingPeriod, periodId?: string): Promise<User[]> {
        const effectiveLeagueId = 'league_170325';
        const response = await api.get(`/leagues/${effectiveLeagueId}/leaderboard`);

        return response.data.map((entry: any) => ({
            id: entry.id || `user_${entry.name}`,
            name: entry.name,
            points: entry.points,
            avatar: entry.avatar_url || entry.avatar || `https://ui-avatars.com/api/?name=${entry.name}`,
            monthlyPoints: entry.monthly_points || 0,
            yearlyPoints: entry.yearly_points || 0,
            monthlyRankDelta: entry.monthly_rank_delta || 0,
            isYoutubeMember: entry.is_youtube_member || false,
            createdAt: new Date(),
            rank: entry.position
        }));
    }

    // Auth
    async login(email: string, password: string): Promise<User | null> {
        try {
            console.log("Tentando login...");

            const response = await api.post('/login', { email, password });
            const { token, user } = response.data as { token: string, user: UserDTO };

            if (token && user) {
                localStorage.setItem('token', token);
                console.log("Login realizado! Token e usuário salvos.");

                return mapUserDTOToDomain(user);
            }
            return null;
        } catch (error) {
            console.error("Erro no login:", error);
            return null;
        }
    }

    async getMe(): Promise<User | null> {
        const response = await api.get('/me');
        return response.data ? mapUserDTOToDomain(response.data as UserDTO) : null;
    }

    async getUserById(id: string): Promise<User | null> {
        const response = await api.get(`/users/${id}`);
        return response.data ? mapUserDTOToDomain(response.data as UserDTO) : null;
    }

    async getLeagues(): Promise<League[]> {
        const response = await api.get('/leagues');
        const data = response.data || [];
        return (data as LeagueDTO[]).map(mapLeagueDTOToDomain);
    }

    // Leagues
    async createLeague(name: string, owner_id: string, description?: string, logo_url?: string): Promise<League> {
        const response = await api.post('/leagues', { name, description, owner_id, logo_url });
        return mapLeagueDTOToDomain(response.data as LeagueDTO);
    }

    async joinLeague(invite_code: string, user_id: string): Promise<League> {
        const response = await api.post(`/leagues/join`, { invite_code, user_id });
        return mapLeagueDTOToDomain(response.data as LeagueDTO);
    }

    async getLeaguesForUser(userId: string): Promise<League[]> {
        const response = await api.get(`/users/${userId}/leagues`);
        return (response.data as LeagueDTO[]).map(mapLeagueDTOToDomain);
    }

    async getLeagueByInviteCode(code: string): Promise<League | null> {
        const response = await api.get(`/leagues/invite/${code}`);
        return response.data ? mapLeagueDTOToDomain(response.data as LeagueDTO) : null;
    }

    async getLeagueById(id: string): Promise<League | null> {
        const response = await api.get(`/leagues/${id}`);
        return response.data ? mapLeagueDTOToDomain(response.data as LeagueDTO) : null;
    }

    async updateLeague(id: string, data: { name: string, description: string, logo_url?: string }): Promise<League> {
        const response = await api.put(`/leagues/${id}`, data);
        return mapLeagueDTOToDomain(response.data as LeagueDTO);
    }

    async deleteLeague(id: string): Promise<void> {
        await api.delete(`/leagues/${id}`);
    }

    async removeMember(leagueId: string, userId: string): Promise<League> {
        const response = await api.delete(`/leagues/${leagueId}/members/${userId}`);
        return response.data;
    }

    async manageAdmin(leagueId: string, user_id: string, action: 'promote' | 'demote'): Promise<League> {
        const response = await api.post(`/leagues/${leagueId}/admins`, { user_id, action });
        return response.data;
    }
}
