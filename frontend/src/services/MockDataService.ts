import { IDataService, RankingPeriod } from './types';
import { Event, Fight, Fighter, User, Pick, League, LeagueMember, LeagueRole } from '../types';



// --- Constants & Helpers ---

export const get_content_lock_status = (event: Event, fight: Fight): { status: 'LOCKED' | 'OPEN', reason?: 'EVENT_CLOSED' | 'FIGHT_CLOSED' | 'CASCADE' | 'MANUAL' } => {
    const now = new Date();

    const evStatus = (event.lock_status || '').toUpperCase();
    const fightStatus = (fight.lock_status || '').toUpperCase();

    // 1. Check Event Level
    if (evStatus === 'LOCKED' || evStatus === 'CLOSED') return { status: 'LOCKED', reason: 'EVENT_CLOSED' };
    if (evStatus === 'SCHEDULED' && event.lock_time && now > new Date(event.lock_time)) {
        return { status: 'LOCKED', reason: 'EVENT_CLOSED' };
    }

    // 2. Check Fight Level
    if (fightStatus === 'LOCKED' || fightStatus === 'CLOSED') return { status: 'LOCKED', reason: 'MANUAL' };
    if (fight.custom_lock_time && now > new Date(fight.custom_lock_time)) {
        return { status: 'LOCKED', reason: 'FIGHT_CLOSED' };
    }

    // 3. Check Cascade
    if (evStatus === 'CASCADE' && event.cascade_start_time && fight.order !== undefined) {
        const cascadeBase = new Date(event.cascade_start_time).getTime();
        // Assume 30 mins per fight order (order 1 = start time, order 2 = start + 30m)
        const fightLockTime = cascadeBase + ((fight.order - 1) * 30 * 60 * 1000);

        if (now.getTime() > fightLockTime) {
            return { status: 'LOCKED', reason: 'CASCADE' };
        }
    }

    return { status: 'OPEN' };
};

const MOCK_NAMES = [
    "Jon Jones", "Anderson Silva", "GSP", "Khabib", "Conor McGregor", "Charles Oliveira", "Alex Pereira",
    "Max Holloway", "Islam Makhachev", "Volkanovski", "José Aldo", "Amanda Nunes", "Cris Cyborg",
    "Valentina Shevchenko", "Rose Namajunas", "Zhang Weili", "Israel Adesanya", "Kamaru Usman",
    "Francis Ngannou", "Stipe Miocic", "Daniel Cormier", "Demetrious Johnson", "Henry Cejudo",
    "Dominick Cruz", "TJ Dillashaw", "Cain Velasquez", "Junior Dos Santos", "Lyoto Machida",
    "Shogun Rua", "Wanderlei Silva", "Minotauro", "Fedor Emelianenko", "Mirko Cro Cop",
    "Dan Henderson", "Randy Couture", "Chuck Liddell", "Tito Ortiz", "Vitor Belfort", "Royce Gracie"
];

const WEIGHT_CLASSES = ['Mosca', 'Galo', 'Pena', 'Leve', 'Meio-Médio', 'Médio', 'M. Pesado', 'Pesado'];
const METHODS = ['KO/TKO', 'DEC', 'SUB', 'DQ'];

const DECISION_TYPES = ['UNÂNIME', 'DIVIDIDA', 'MAJORITÁRIA'];

const initialFighters: Record<string, Fighter> = {
    'omally': { id: 'omally', name: "Sean O'Malley", nickname: "Suga", image_url: "/assets/images/fighter_1.png", wins: 17, losses: 1, draws: 0, nc: 0 },
    'vera': { id: 'vera', name: "Marlon Vera", nickname: "Chito", image_url: "/assets/images/fighter_2.png", wins: 23, losses: 8, draws: 1, nc: 0 },
    'poirier': { id: 'poirier', name: "Dustin Poirier", nickname: "The Diamond", image_url: "/assets/images/fighter_3.png", wins: 29, losses: 8, draws: 0, nc: 0 },
    'saintdenis': { id: 'saintdenis', name: "Benoit Saint Denis", nickname: "God of War", image_url: "/assets/images/fighter_4.png", wins: 13, losses: 1, draws: 0, nc: 0 }
};

const initialEvents: Event[] = [
    {
        id: 'evt_jan03',
        title: 'UFC Fight Night',
        subtitle: 'Holloway vs Topuria',
        date: '2026-01-03T18:00:00',
        location: 'Las Vegas, NV',
        banner_url: '/assets/images/banner_1.png',
        status: 'completed'
    },
    {
        id: 'evt_jan10',
        title: 'UFC Fight Night',
        subtitle: 'Whittaker vs Chimaev',
        date: '2026-01-10T20:00:00',
        location: 'Abu Dhabi, UAE',
        banner_url: '/assets/images/banner_2.png',
        status: 'completed'
    },
    {
        id: 'evt_jan17',
        title: 'UFC 312',
        subtitle: 'Du Plessis vs Adesanya 2',
        date: '2026-01-17T22:00:00',
        location: 'Perth, Australia',
        banner_url: '/assets/images/banner_3.png',
        status: 'completed'
    },
    {
        id: 'evt_jan24',
        title: 'UFC Fight Night',
        subtitle: 'Sandhagen vs Nurmagomedov',
        date: '2026-01-24T17:00:00',
        location: 'Abu Dhabi, UAE',
        banner_url: '/assets/images/banner_1.png',
        status: 'completed'
    },
    {
        id: 'evt_jan31',
        title: 'UFC 313',
        subtitle: 'Pereira vs Ankalaev',
        date: '2026-01-31T22:00:00',
        location: 'Las Vegas, NV',
        banner_url: '/assets/images/banner_2.png',
        status: 'live'
    },
    {
        id: 'evt_ufc325',
        title: 'UFC 325',
        subtitle: 'Volkanovski vs Lopes',
        date: '2026-01-31T19:00:00',
        location: 'Sydney, AUS',
        banner_url: '/assets/images/banner_3.png',
        status: 'upcoming'
    }
];

// --- Deterministic Random Helper ---
const seededRandom = (seed: string) => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = ((hash << 5) - hash) + seed.charCodeAt(i);
        hash |= 0;
    }
    const x = Math.sin(hash) * 10000;
    return x - Math.floor(x);
};

const generateFightersAndFights = () => {
    let fighters: Record<string, Fighter> = { ...initialFighters };
    let fights: Fight[] = [];

    const getFighter = (name: string): Fighter => {
        const id = name.toLowerCase().replace(/\s/g, '').replace(/[\.'-]/g, '');
        if (!fighters[id]) {
            const seed = hashString(name);
            const imgIdx = (seed % 5) + 1;
            fighters[id] = {
                id,
                name,
                nickname: 'The ' + name.split(' ').pop(),
                image_url: `/assets/images/fighter_${imgIdx}.png`,
                wins: Math.floor(seededRandom(name + 'wins') * 30),
                losses: Math.floor(seededRandom(name + 'losses') * 10),
                draws: Math.floor(seededRandom(name + 'draws') * 3),
                nc: 0
            };
        }
        return fighters[id];
    };

    const hashString = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
        }
        return Math.abs(hash);
    };

    // --- UFC 325 Card ---
    const ufc325Card = [
        { f1: "Alexander Volkanovski", f2: "Diego Lopes", cat: "Main Event", weight: "Pena", title: true },
        { f1: "Dan Hooker", f2: "Benoit Saint Denis", cat: "Co-Main", weight: "Leve", title: false },
        { f1: "Rafael Fiziev", f2: "Mauricio Ruffy", cat: "Main Card", weight: "Leve", title: false },
        { f1: "Tai Tuivasa", f2: "Tallison Teixeira", cat: "Main Card", weight: "Pesado", title: false },
        { f1: "Quillan Salkilld", f2: "Jamie Mullarkey", cat: "Main Card", weight: "Leve", title: false },
        { f1: "Junior Tafa", f2: "Billy Elekana", cat: "Prelim", weight: "M. Pesado", title: false },
        { f1: "Cam Rowston", f2: "Cody Brundage", cat: "Prelim", weight: "Médio", title: false },
        { f1: "Jacob Malkoun", f2: "Torrez Finney", cat: "Prelim", weight: "Médio", title: false },
        { f1: "Jonathan Micallef", f2: "Oban Elliott", cat: "Prelim", weight: "Meio-Médio", title: false },
        { f1: "Kaan Ofli", f2: "Yizha", cat: "Prelim", weight: "Pena", title: false },
        { f1: "Dom Mar Fan", f2: "Sang Uk Kim", cat: "Early", weight: "Leve", title: false },
        { f1: "Sebastian Szalay", f2: "Keiichiro Nakamura", cat: "Early", weight: "Pena", title: false },
        { f1: "Sulangrangbo", f2: "Lawrence Lui", cat: "Early", weight: "Galo", title: false },
        { f1: "Namsrai Batbayar", f2: "Aaron Tau", cat: "Early", weight: "Mosca", title: false }
    ];

    ufc325Card.forEach((f, i) => {
        const fighterA = getFighter(f.f1);
        const fighterB = getFighter(f.f2);
        fights.push({
            id: `fight_evt_ufc325_${i}`,
            event_id: 'evt_ufc325',
            fighter_a_id: fighterA.id,
            fighter_b_id: fighterB.id,
            fighter_a: fighterA,
            fighter_b: fighterB,
            category: f.cat as any,
            weight_class: f.weight as any,
            rounds: f.cat === 'Main Event' ? 5 : 3,
            is_title: f.title,
            points: 0
        });
    });

    initialEvents.forEach(event => {
        if (event.id === 'evt_ufc325') return;
        for (let i = 0; i < 15; i++) {
            const seedPrefix = `${event.id}_${i}`;
            const idx1 = Math.floor(seededRandom(seedPrefix + '_f1') * MOCK_NAMES.length);
            let idx2 = Math.floor(seededRandom(seedPrefix + '_f2') * MOCK_NAMES.length);
            while (idx1 === idx2) idx2 = Math.floor(seededRandom(seedPrefix + '_f2_retry') * MOCK_NAMES.length);

            const f1 = getFighter(MOCK_NAMES[idx1]);
            const f2 = getFighter(MOCK_NAMES[idx2]);

            let category: Fight['category'] = 'Prelim';
            if (i === 0) category = 'Main Event';
            else if (i === 1) category = 'Co-Main';
            else if (i < 5) category = 'Main Card';
            else if (i < 10) category = 'Prelim';
            else category = 'Early';

            const isCompleted = event.status === 'completed';
            let winner: Fighter | undefined;
            let result: Fight['result'] | undefined;
            let method: string | undefined;
            let round_end: string | undefined;
            let time: string | undefined;

            if (isCompleted) {
                const rand = seededRandom(seedPrefix + '_result');
                if (rand > 0.98) {
                    result = 'nc';
                    method = 'NC (Eye Poke)';
                    round_end = `R${Math.floor(seededRandom(seedPrefix + '_r') * 3) + 1}`;
                    time = `${Math.floor(seededRandom(seedPrefix + '_t') * 5)}:${Math.floor(seededRandom(seedPrefix + '_tm') * 60).toString().padStart(2, '0')}`;
                } else if (rand > 0.95) {
                    result = 'draw';
                    method = 'Draw (Majority)';
                    round_end = `R${category === 'Main Event' ? 5 : 3}`;
                    time = '5:00';
                } else {
                    result = 'win';
                    winner = seededRandom(seedPrefix + '_win') > 0.5 ? f1 : f2;
                    const methodRand = seededRandom(seedPrefix + '_meth');
                    if (methodRand > 0.6) {
                        const decType = DECISION_TYPES[Math.floor(seededRandom(seedPrefix + '_dec') * DECISION_TYPES.length)];
                        method = `DEC (${decType})`;
                        round_end = `R${category === 'Main Event' ? 5 : 3}`;
                        time = '5:00';
                    } else if (methodRand > 0.3) {
                        method = 'KO/TKO (Punch)';
                        round_end = `R${Math.floor(seededRandom(seedPrefix + '_ko_r') * (category === 'Main Event' ? 5 : 3)) + 1}`;
                        time = `${Math.floor(seededRandom(seedPrefix + '_ko_t') * 5)}:${Math.floor(seededRandom(seedPrefix + '_ko_tm') * 60).toString().padStart(2, '0')}`;
                    } else {
                        method = 'SUB (Rear Naked Choke)';
                        round_end = `R${Math.floor(seededRandom(seedPrefix + '_sub_r') * (category === 'Main Event' ? 5 : 3)) + 1}`;
                        time = `${Math.floor(seededRandom(seedPrefix + '_sub_t') * 5)}:${Math.floor(seededRandom(seedPrefix + '_sub_tm') * 60).toString().padStart(2, '0')}`;
                    }
                }
            }

            fights.push({
                id: `fight_${event.id}_${i}`,
                event_id: event.id,
                fighter_a_id: f1.id,
                fighter_b_id: f2.id,
                fighter_a: f1,
                fighter_b: f2,
                category,
                weight_class: WEIGHT_CLASSES[Math.floor(seededRandom(seedPrefix + '_wc') * WEIGHT_CLASSES.length)] as any,
                rounds: category === 'Main Event' ? 5 : 3,
                is_title: category === 'Main Event' && seededRandom(seedPrefix + '_title') > 0.6,
                winner_id: winner?.id,
                result,
                method,
                round_end,
                time,
                points: 0
            });
        }
    });

    return { fighters, fights };
};

const generateUsersAndPicks = (fights: Fight[]) => {
    const users: User[] = [];
    const picks: Pick[] = [];

    const adminUser: User = {
        id: 'user_andre',
        name: 'André',
        email: 'andre@arena.com',
        avatar_url: 'https://ui-avatars.com/api/?name=Andre&background=random',
        points: 0,
        monthly_points: 0,
        yearly_points: 0,
        monthly_rank_delta: 0,
        yearly_rank_delta: 0,
        is_youtube_member: true,
        youtube_channel_id: 'UC_mock_andre',
        last_youtube_sync: new Date().toISOString(),
        created_at: new Date().toISOString()
    };
    users.push(adminUser);

    for (let i = 0; i < 30; i++) {
        const name = MOCK_NAMES[i % MOCK_NAMES.length];
        const sanitizedId = name.toLowerCase().replace(/\./g, '').replace(/\s/g, '_');

        const imgIdx = (i % 3) + 1;

        users.push({
            id: sanitizedId,
            name: name,
            email: `${sanitizedId}@example.com`,
            avatar_url: `/assets/images/user_${imgIdx}.png`,
            points: Math.floor(Math.random() * 100),
            monthly_points: Math.floor(Math.random() * 30),
            yearly_points: Math.floor(Math.random() * 100),
            monthly_rank_delta: 0,
            yearly_rank_delta: 0,
            is_youtube_member: Math.random() > 0.8,
            youtube_channel_id: Math.random() > 0.8 ? `UC_mock_${sanitizedId}` : null,
            last_youtube_sync: new Date().toISOString(),
            created_at: new Date().toISOString()
        });
    }

    users.forEach(user => {
        // Pula a geração automática para o usuário principal para que ele possa palpitar manualmente
        // if (user.id === 'user_andre') return; // TEMPORARY: Commented out to generate data for Andre for UI verification

        fights.forEach(fight => {
            const event = initialEvents.find(e => e.id === fight.event_id);
            if (event) {
                let selectedFighterId: string;
                const randomWin = Math.random();
                if (randomWin > 0.5) {
                    selectedFighterId = fight.fighter_a_id;
                } else {
                    selectedFighterId = fight.fighter_b_id;
                }

                const methods: ('KO/TKO' | 'SUB' | 'DEC')[] = ['KO/TKO', 'SUB', 'DEC'];
                const randomMethod = methods[Math.floor(Math.random() * methods.length)];

                let randomRound = '';
                if (randomMethod === 'DEC') {
                    randomRound = DECISION_TYPES[Math.floor(Math.random() * DECISION_TYPES.length)];
                } else {
                    const maxRounds = fight.rounds;
                    randomRound = `R${Math.floor(Math.random() * maxRounds) + 1}`;
                }

                const pick: Pick = {
                    id: `pick_${user.id}_${fight.id}`,
                    user_id: user.id,
                    event_id: fight.event_id,
                    fight_id: fight.id,
                    fighter_id: selectedFighterId,
                    method: randomMethod,
                    round: randomRound,
                    points_earned: 0
                };

                picks.push(pick);
            }
        });
    });

    return { users, picks };
}

const { fighters: generatedFighters, fights: generatedFights } = generateFightersAndFights();
const { users: generatedUsers, picks: generatedPicks } = generateUsersAndPicks(generatedFights);

export class MockDataService implements IDataService {
    private events: Event[] = [...initialEvents];
    private fights: Fight[] = [...generatedFights];
    private fighters: Record<string, Fighter> = { ...generatedFighters };
    private users: User[] = [];
    private picks: Pick[] = [];
    private leagues: League[] = [];
    private currentUser: User | null = null;




    constructor() {
        this.init();
    }

    private init() {
        // Load data from LocalStorage or fallback to generated
        this.users = this.loadData('arena_users', generatedUsers);
        this.picks = this.loadData('arena_picks', generatedPicks);
        this.leagues = this.loadLeagues();

        const savedUser = localStorage.getItem('arena_current_user');
        this.currentUser = savedUser ? JSON.parse(savedUser) : this.users[0];

        this.recalculateAllPoints();
    }

    private loadData<T>(key: string, fallback: T): T {
        if (typeof window === 'undefined') return fallback;
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : fallback;
    }

    private saveData(key: string, data: any) {
        if (typeof window === 'undefined') return;
        localStorage.setItem(key, JSON.stringify(data));
    }


    private recalculateAllPoints() {
        const fightMap = new Map(this.fights.map(f => [f.id, f]));

        // Optimize: Group picks by fight_id
        const picksByFight = new Map<string, Pick[]>();
        this.picks.forEach(p => {
            const list = picksByFight.get(p.fight_id) || [];
            list.push(p);
            picksByFight.set(p.fight_id, list);
        });

        picksByFight.forEach((picks, fight_id) => {
            const fight = fightMap.get(fight_id);
            if (fight && fight.winner_id) {
                this.recalculatePointsForFightInternal(fight, picks);
            }
        });

        this.users.forEach(u => this.recalculateUserPointsInternal(u.id));
        this.recalculateRanks();
    }

    private recalculateRanks() {
        // Find Last Event
        const completedEvents = this.events
            .filter(e => this.calculateStatus(e) === 'completed')
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        if (completedEvents.length === 0) return;
        const lastEventId = completedEvents[0].id;

        // 1. Calculate Monthly Delta
        this.calculatePeriodDelta('monthly_points', 'monthly_rank_delta', lastEventId);

        // 2. Calculate Yearly Delta
        this.calculatePeriodDelta('yearly_points', 'yearly_rank_delta', lastEventId);
    }

    private calculatePeriodDelta(points_field: 'monthly_points' | 'yearly_points', delta_field: keyof User, last_event_id: string) {
        // Points including last event
        const current_points = this.users.map(u => ({ id: u.id, points: (u as any)[points_field] || 0 }));
        const current_rank_map = this.getRankMap(current_points);

        // Optimize: Pre-calculate last event points for ALL users
        const last_event_points_map = new Map<string, number>();
        this.picks.filter(p => p.event_id === last_event_id).forEach(p => {
            const current = last_event_points_map.get(p.user_id) || 0;
            last_event_points_map.set(p.user_id, current + (p.points_earned || 0));
        });

        // Points excluding last event
        const previous_points = this.users.map(u => {
            const last_event_points = last_event_points_map.get(u.id) || 0;
            return { id: u.id, points: ((u as any)[points_field] || 0) - last_event_points };
        });
        const previous_rank_map = this.getRankMap(previous_points);

        this.users.forEach(u => {
            const curRank = current_rank_map[u.id];
            const prevRank = previous_rank_map[u.id];
            (u as any)[delta_field] = prevRank - curRank;
        });
    }

    private getRankMap(userPoints: { id: string, points: number }[]) {
        const sorted = [...userPoints].sort((a, b) => b.points - a.points);
        const map: Record<string, number> = {};
        sorted.forEach((u, index) => {
            // Handle ties: if same points, same rank
            if (index > 0 && u.points === sorted[index - 1].points) {
                map[u.id] = map[sorted[index - 1].id];
            } else {
                map[u.id] = index + 1;
            }
        });
        return map;
    }

    private recalculatePointsForFightInternal(fight: Fight, picks?: Pick[]) {
        const fight_picks = picks || this.picks.filter(p => p.fight_id === fight.id);
        if (fight_picks.length === 0) return;

        const correct_winner_picks = fight_picks.filter(p => p.fighter_id === fight.winner_id);
        const isMitada = correct_winner_picks.length === 1;

        const isNonTitleMainEvent = fight.category === 'Main Event' && !fight.is_title;

        fight_picks.forEach(pick => {
            let points = 0;

            if (fight.winner_id && pick.fighter_id === fight.winner_id) {
                points += 3;
                if (fight.is_title) points += 6;
                else if (isNonTitleMainEvent) points += 3;

                if (isMitada) points += 9;

                let methodCorrect = false;
                if (fight.method && pick.method && fight.method.includes(pick.method)) {
                    methodCorrect = true;
                    points += 2;
                }

                if (methodCorrect) {
                    let roundCorrect = false;
                    if (pick.method === 'DEC') {
                        if (fight.method?.includes(pick.round || '')) {
                            roundCorrect = true;
                        }
                    } else {
                        if (fight.round_end === pick.round) {
                            roundCorrect = true;
                        }
                    }

                    if (roundCorrect) points += 1;
                }
            } else {
                points = 0;
            }

            pick.points_earned = points;
        });
    }

    private async delay(ms: number = 50) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private calculateStatus(event: Event): Event['status'] {
        const now = new Date();
        const start = new Date(event.date);
        const end = event.end_date ? new Date(event.end_date) : new Date(start.getTime() + 8 * 60 * 60 * 1000);

        if (now > end) return 'completed';
        else if (now >= start && now <= end) return 'live';
        else return 'upcoming';
    }

    async get_events(): Promise<Event[]> {
        await this.delay();
        return this.events.map(e => ({ ...e, status: this.calculateStatus(e) }));
    }

    async get_event(id: string): Promise<Event | null> {
        await this.delay();
        const event = this.events.find(e => e.id === id);
        if (!event) return null;
        return { ...event, status: this.calculateStatus(event) };
    }

    async create_event(event: Omit<Event, 'id'>): Promise<Event> {
        await this.delay();
        const newEventVal: Event = { ...event, id: `evt_${Date.now()}`, status: 'upcoming' };
        newEventVal.status = this.calculateStatus(newEventVal);
        this.events.push(newEventVal);
        return newEventVal;
    }

    async update_event(event: Event): Promise<Event> {
        await this.delay();
        const index = this.events.findIndex(e => e.id === event.id);
        if (index !== -1) {
            const updatedEvent = { ...event, status: this.calculateStatus(event) };
            this.events[index] = updatedEvent;
            return updatedEvent;
        }
        return event;
    }

    async delete_event(id: string): Promise<void> {
        await this.delay();
        this.events = this.events.filter(e => e.id !== id);
        this.fights = this.fights.filter(f => f.event_id !== id);
    }

    async get_admin_events(): Promise<Event[]> {
        await this.delay();
        return this.events;
    }

    async get_fights(event_id: string): Promise<Fight[]> {
        await this.delay();
        return this.fights.filter(f => f.event_id === event_id);
    }

    async create_fight(fight: Fight): Promise<Fight> {
        await this.delay();
        const new_fight = { ...fight, id: `fight_${Date.now()}` };
        this.fights.push(new_fight);
        return new_fight;
    }

    async update_fight(fight: Fight): Promise<Fight> {
        await this.delay();
        const index = this.fights.findIndex(f => f.id === fight.id);
        if (index !== -1) {
            this.fights[index] = fight;
            if (fight.winner_id) {
                const fight_picks = this.picks.filter(p => p.fight_id === fight.id);
                this.recalculatePointsForFightInternal(fight, fight_picks);

                const affectedUserIds = Array.from(new Set(fight_picks.map(p => p.user_id)));
                for (const userId of affectedUserIds) {
                    await this.recalculateUserPointsInternal(userId);
                }
                this.recalculateRanks();
            }
        }
        return fight;
    }

    async delete_fight(id: string): Promise<void> {
        await this.delay();
        this.fights = this.fights.filter(f => f.id !== id);
    }

    async get_fighters(): Promise<Fighter[]> {
        await this.delay();
        return Object.values(this.fighters);
    }

    async create_fighter(fighter: Omit<Fighter, 'id'>): Promise<Fighter> {
        await this.delay();
        const new_fighter = { ...fighter, id: `fighter_${Date.now()}` };
        this.fighters[new_fighter.id] = new_fighter;
        return new_fighter;
    }

    async get_leaderboard(period: RankingPeriod = 'all', period_id?: string): Promise<User[]> {
        await this.delay();

        let sortedUsers = [...this.users];

        if (period_id) {
            // For specifically requested periods (past events, specific months/years)
            // we calculate the score on the fly for those users based on picks
            const usersWithSpecificScore = this.users.map(u => {
                const user_picks = this.picks.filter(p => p.user_id === u.id);
                let score = 0;

                user_picks.forEach(pick => {
                    const pts = pick.points_earned || 0;
                    const event = this.events.find(e => e.id === pick.event_id);
                    if (!event) return;

                    if (period === 'week' && pick.event_id === period_id) {
                        score += pts;
                    } else if (period === 'month' && period_id) {
                        const eventDate = new Date(event.date);
                        const [y, m] = period_id.split('-').map(Number);
                        if (eventDate.getFullYear() === y && eventDate.getMonth() === (m - 1)) {
                            score += pts;
                        }
                    } else if (period === 'year' && period_id) {
                        const eventDate = new Date(event.date);
                        if (eventDate.getFullYear() === Number(period_id)) {
                            score += pts;
                        }
                    }
                });

                return {
                    ...u,
                    points: period === 'all' ? score : u.points,
                    monthly_points: period === 'month' ? score : u.monthly_points,
                    yearly_points: period === 'year' ? score : u.yearly_points,
                };
            });
            sortedUsers = usersWithSpecificScore;
        }

        if (period === 'month') {
            sortedUsers.sort((a, b) => (b.monthly_points || 0) - (a.monthly_points || 0));
        } else if (period === 'year' || period === 'all') {
            sortedUsers.sort((a, b) => (b.yearly_points || 0) - (a.yearly_points || 0));
        } else if (period === 'week') {
            sortedUsers.sort((a, b) => (b.monthly_points || 0) - (a.monthly_points || 0));
        }

        return sortedUsers.slice(0, 50);
    }

    async get_picks_for_event(event_id: string): Promise<Record<string, Pick>> {
        await this.delay();
        const userId = this.currentUser?.id || 'user_andre';
        const user_picks = this.picks.filter(p => p.event_id === event_id && p.user_id === userId);
        const picks_map: Record<string, Pick> = {};
        user_picks.forEach(p => picks_map[p.fight_id] = p);
        return picks_map;
    }

    async login(email: string, password: string): Promise<User | null> {
        await this.delay(500);

        const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase() && (u as any).password === password);
        if (user) {
            this.currentUser = user;
            this.saveData('arena_current_user', user);
            return user;
        }
        return null;
    }

    async get_me(): Promise<User | null> {
        await this.delay(50);
        const user_id = this.currentUser?.id || 'user_andre';
        const user = this.users.find(u => u.id === user_id);
        return user || null;
    }

    async get_user_by_id(id: string): Promise<User | null> {
        await this.delay(50);
        const user = this.users.find(u => u.id === id);
        return user || null;
    }

    async get_all_picks_for_event(event_id: string): Promise<Pick[]> {
        await this.delay();
        return this.picks.filter(p => p.event_id === event_id);
    }

    async submit_pick(data: any): Promise<void> {
        await this.delay();

        // Se receber o payload simplificado (snake_case), converter para objeto Pick do domínio
        const userId = data.user_id || data.userId;
        const fightId = data.fight_id || data.fightId;
        const pick: Pick = {
            id: data.id || `pick_${userId}_${fightId}`,
            user_id: userId,
            event_id: data.event_id || data.eventId || 'evt_ufc325',
            fight_id: fightId,
            fighter_id: data.fighter_id || data.fighterId,
            method: data.method,
            round: data.round,
            points_earned: data.points_earned || data.pointsEarned || 0
        };

        const index = this.picks.findIndex(p => p.id === pick.id);
        if (index !== -1) {
            this.picks[index] = pick;
        } else {
            this.picks.push(pick);
        }
        await this.recalculateUserPointsInternal(pick.user_id);
        this.recalculateRanks();
        this.saveData('arena_picks', this.picks);
        this.saveData('arena_users', this.users);
    }

    async submit_picks_batch(picks: any[]): Promise<void> {
        await this.delay();
        for (const pickData of picks) {
            await this.submit_pick(pickData);
        }
    }

    private async recalculateUserPointsInternal(userId: string): Promise<void> {
        const user_picks = this.picks.filter(p => p.user_id === userId);

        // Map events for fast access
        const eventMap = new Map(this.events.map(e => [e.id, e]));

        // Find Last Event (completed)
        const completedEvents = this.events
            .filter(e => this.calculateStatus(e) === 'completed')
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const lastEventId = completedEvents.length > 0 ? completedEvents[0].id : null;

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        let totalPoints = 0;
        let lastEventPoints = 0;
        let monthlyPoints = 0;
        let yearlyPoints = 0;

        user_picks.forEach(pick => {
            const pts = pick.points_earned || 0;
            totalPoints += pts;

            const event = eventMap.get(pick.event_id);
            if (event) {
                const eventDate = new Date(event.date);

                if (lastEventId && pick.event_id === lastEventId) {
                    lastEventPoints += pts;
                }

                if (eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear) {
                    monthlyPoints += pts;
                }

                if (eventDate.getFullYear() === currentYear) {
                    yearlyPoints += pts;
                }
            }
        });

        const userIndex = this.users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            this.users[userIndex] = {
                ...this.users[userIndex],
                points: totalPoints,
                monthly_points: monthlyPoints,
                yearly_points: yearlyPoints
            };
        }
    }

    // --- Leagues Implementation ---

    private loadLeagues(): League[] {
        if (typeof window === 'undefined') return [];
        const saved = localStorage.getItem('arena_leagues');
        let leagues = saved ? JSON.parse(saved) : [];

        // Seed with mock data if empty
        if (leagues.length === 0) {
            const mockLeagues = this.generateMockLeagues();
            this.leagues = mockLeagues;
            this.saveLeagues();
            return mockLeagues;
        }

        // Data migration: Ensure all leagues have an admins array
        const migratedLeagues = leagues.map((l: any) => ({
            ...l,
            // Ensure members have a role and all required fields
            members: l.members.map((m: any) => {
                const user_id = typeof m === 'string' ? m : m.user_id;
                return {
                    id: m.id || `lm_${l.id}_${user_id}`,
                    league_id: l.id,
                    user_id: user_id,
                    role: m.role || 'MEMBER',
                    joined_at: m.joined_at || new Date().toISOString()
                };
            }),
            // Remove admins array if it exists, as roles are now in members
            admins: undefined
        }));

        this.leagues = migratedLeagues;
        return migratedLeagues;
    }

    private generateMockLeagues(): League[] {
        const userId = 'user_andre';
        const ownedNames = ["Amigos do Tatame", "Elite MMA Club", "Vips do Octógono"];
        const memberNames = ["Gladiadores de Rua", "Nocaute Total", "Brazilian Top Team"];

        const otherUsers = this.users.filter(u => u.id !== userId);
        const mockLeagues: League[] = [];

        // 3 Owned by user_andre
        ownedNames.forEach((name, i) => {
            const leagueId = name === "Amigos do Tatame" ? "league_170325" : `league_owned_${i}`;
            const memberIds = [userId, ...otherUsers.slice(i * 4, (i + 1) * 4).map(u => u.id)];
            const members: LeagueMember[] = memberIds.map(id => ({
                id: `lm_${leagueId}_${id}`,
                league_id: leagueId,
                user_id: id,
                role: (id === userId ? 'OWNER' : 'MEMBER') as LeagueRole,
                joined_at: new Date().toISOString()
            }));

            mockLeagues.push({
                id: leagueId,
                name,
                description: `A liga oficial para os entusiastas da ${name}.`,
                logo_url: `https://picsum.photos/seed/league${i}/400`,
                owner_id: userId,
                members,
                invite_code: `OWNED${i + 1}`,
                members_count: members.length,
                created_at: new Date().toISOString()
            });
        });

        // 3 Where user_andre is a member
        memberNames.forEach((name, i) => {
            const ownerId = otherUsers[i]?.id || 'admin';
            const leagueId = `league_member_${i}`;
            const memberIds = [ownerId, userId, ...otherUsers.slice((i + 3) * 4, (i + 4) * 4).map(u => u.id)];
            const members: LeagueMember[] = memberIds.map(id => ({
                id: `lm_${leagueId}_${id}`,
                league_id: leagueId,
                user_id: id,
                role: (id === ownerId ? 'OWNER' : 'MEMBER') as LeagueRole,
                joined_at: new Date().toISOString()
            }));

            mockLeagues.push({
                id: leagueId,
                name,
                description: `Bem-vindo à ${name}, onde a porrada estanca!`,
                logo_url: `https://picsum.photos/seed/memberleague${i}/400`,
                owner_id: ownerId,
                members,
                invite_code: `MEMB${i + 1}`,
                members_count: members.length,
                created_at: new Date().toISOString()
            });
        });

        return mockLeagues;
    }

    private saveLeagues() {
        if (typeof window === 'undefined') return;
        localStorage.setItem('arena_leagues', JSON.stringify(this.leagues));
    }


    async get_leagues(): Promise<League[]> {
        await this.delay();
        return this.leagues;
    }

    async create_league(name: string, owner_id: string, description?: string, logo_url?: string): Promise<League> {
        await this.delay();

        // Validate limit (max 5 created leagues)
        const ownedLeagues = this.leagues.filter(l => l.owner_id === owner_id);
        if (ownedLeagues.length >= 5) {
            throw new Error("Você já criou o limite máximo de 5 ligas.");
        }

        const league_id = `league_${Date.now()}`;
        const newLeague: League = {
            id: league_id,
            name,
            description: description || '',
            logo_url: logo_url || 'https://github.com/shadcn.png',
            owner_id,
            members: [{
                id: `lm_${league_id}_${owner_id}`,
                league_id,
                user_id: owner_id,
                role: 'OWNER',
                joined_at: new Date().toISOString()
            } as LeagueMember], // Owner is automatically a member
            invite_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
            members_count: 1,
            created_at: new Date().toISOString()
        };

        this.leagues.push(newLeague);
        this.saveLeagues();
        return newLeague;
    }


    async join_league(invite_code: string, user_id: string): Promise<League> {
        await this.delay();

        const leagueIndex = this.leagues.findIndex(l => l.invite_code === invite_code);
        if (leagueIndex === -1) {
            throw new Error("Código de convite inválido.");
        }

        const league = this.leagues[leagueIndex];

        if (league.members.some(m => m.user_id === user_id)) {
            return league; // User already in league, just return it
        }

        // Create updated league object
        const updatedLeague = {
            ...league,
            members: [...league.members, {
                id: `lm_${league.id}_${user_id}`,
                league_id: league.id,
                user_id,
                role: 'MEMBER' as LeagueRole,
                joined_at: new Date().toISOString()
            } as LeagueMember],
            members_count: (league.members_count || 0) + 1
        };

        this.leagues[leagueIndex] = updatedLeague;
        this.saveLeagues();
        return updatedLeague;
    }


    async get_leagues_for_user(userId: string): Promise<League[]> {
        await this.delay();
        return this.leagues.filter(l => l.members.some(m => m.user_id === userId));
    }

    async get_league_by_invite_code(code: string): Promise<League | null> {
        await this.delay();
        return this.leagues.find(l => l.invite_code === code) || null;
    }

    async get_league_by_id(id: string): Promise<League | null> {
        await this.delay();
        return this.leagues.find(l => l.id === id) || null;
    }

    async update_league(id: string, data: { name: string, description: string, logo_url?: string }): Promise<League> {
        await this.delay();
        const index = this.leagues.findIndex(l => l.id === id);
        if (index !== -1) {
            const updatedLeague = {
                ...this.leagues[index],
                name: data.name,
                description: data.description,
                logo_url: data.logo_url || this.leagues[index].logo_url
            };
            this.leagues[index] = updatedLeague;
            this.saveLeagues();
            return updatedLeague;
        }
        throw new Error("Liga não encontrada.");
    }

    async delete_league(id: string): Promise<void> {
        await this.delay();
        this.leagues = this.leagues.filter(l => l.id !== id);
        this.saveLeagues();
    }

    async remove_member(leagueId: string, userId: string): Promise<League> {
        await this.delay();
        const leagueIndex = this.leagues.findIndex(l => l.id === leagueId);
        if (leagueIndex === -1) throw new Error("Liga não encontrada.");

        const league = this.leagues[leagueIndex];
        if (league.owner_id === userId) throw new Error("O dono não pode ser removido da liga.");

        const updatedLeague = {
            ...league,
            members: league.members?.filter(m => m.user_id !== userId) || [],
            members_count: Math.max(0, (league.members_count || 0) - 1)
        };

        this.leagues[leagueIndex] = updatedLeague;
        this.saveLeagues();
        return updatedLeague;
    }

    async manage_admin(leagueId: string, user_id: string, action: 'promote' | 'demote'): Promise<League> {
        await this.delay();
        const leagueIndex = this.leagues.findIndex(l => l.id === leagueId);
        if (leagueIndex === -1) throw new Error("Liga não encontrada.");

        const league = this.leagues[leagueIndex];
        const updatedMembers = league.members?.map(m => {
            if (m.user_id === user_id) {
                return { ...m, role: (action === 'promote' ? 'ADMIN' : 'MEMBER') as LeagueRole };
            }
            return m;
        }) || [];

        const updatedLeague = {
            ...league,
            members: updatedMembers
        };

        this.leagues[leagueIndex] = updatedLeague;
        this.saveLeagues();
        return updatedLeague;
    }
}

