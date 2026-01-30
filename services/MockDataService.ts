import { IDataService, RankingPeriod } from './types';
import { Event, Fight, Fighter, User, Pick } from '../types';

// --- Constants & Helpers ---

export const getContentLockStatus = (event: Event, fight: Fight): { status: 'LOCKED' | 'OPEN', reason?: 'EVENT_CLOSED' | 'FIGHT_CLOSED' | 'CASCADE' | 'MANUAL' } => {
    const now = new Date();

    // 1. Check Event Level
    if (event.lock_status === 'locked') return { status: 'LOCKED', reason: 'EVENT_CLOSED' };
    if (event.lock_status === 'scheduled' && event.lock_time && now > new Date(event.lock_time)) {
        return { status: 'LOCKED', reason: 'EVENT_CLOSED' };
    }

    // 2. Check Fight Level
    if (fight.lock_status === 'locked') return { status: 'LOCKED', reason: 'MANUAL' };
    if (fight.custom_lock_time && now > new Date(fight.custom_lock_time)) {
        return { status: 'LOCKED', reason: 'FIGHT_CLOSED' };
    }

    // 3. Check Cascade
    if (event.lock_status === 'cascade' && event.cascade_start_time && fight.order !== undefined) {
        const cascadeBase = new Date(event.cascade_start_time).getTime();
        // Assume 30 mins per fight order (order 1 = start time, order 2 = start + 30m)
        // Adjust logic: Order 1 closes at start time? Or starts closing? 
        // User request: "fechar a cada meia hora". 
        // Let's say Order 1 closes at cascade_start_time. Order 2 at cascade_start_time + 30m.
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

const generateFightersAndFights = () => {
    let fighters: Record<string, Fighter> = { ...initialFighters };
    let fights: Fight[] = [];

    const getFighter = (name: string): Fighter => {
        const id = name.toLowerCase().replace(/\s/g, '').replace(/[\.'-]/g, '');
        if (!fighters[id]) {
            // Cycle through 5 generic fighter images
            const imgIdx = (Object.keys(fighters).length % 5) + 1;
            fighters[id] = {
                id,
                name,
                nickname: 'The ' + name.split(' ').pop(),
                image_url: `/assets/images/fighter_${imgIdx}.png`,
                wins: Math.floor(Math.random() * 30),
                losses: Math.floor(Math.random() * 10),
                draws: Math.floor(Math.random() * 3),
                nc: 0
            };
        }
        return fighters[id];
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
        if (event.id === 'evt_ufc325') return; // Skip UFC 325 as we manually defined its card
        for (let i = 0; i < 15; i++) {
            const idx1 = Math.floor(Math.random() * MOCK_NAMES.length);
            let idx2 = Math.floor(Math.random() * MOCK_NAMES.length);
            while (idx1 === idx2) idx2 = Math.floor(Math.random() * MOCK_NAMES.length);

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
                const rand = Math.random();
                if (rand > 0.98) {
                    result = 'nc';
                    method = 'NC (Eye Poke)';
                    round_end = `R${Math.floor(Math.random() * 3) + 1}`;
                    time = `${Math.floor(Math.random() * 5)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;
                } else if (rand > 0.95) {
                    result = 'draw';
                    method = 'Draw (Majority)';
                    round_end = `R${category === 'Main Event' ? 5 : 3}`;
                    time = '5:00';
                } else {
                    result = 'win';
                    winner = Math.random() > 0.5 ? f1 : f2;
                    const methodRand = Math.random();
                    if (methodRand > 0.6) {
                        const decType = DECISION_TYPES[Math.floor(Math.random() * DECISION_TYPES.length)];
                        method = `DEC (${decType})`;
                        round_end = `R${category === 'Main Event' ? 5 : 3}`;
                        time = '5:00';
                    } else if (methodRand > 0.3) {
                        method = 'KO/TKO (Punch)';
                        round_end = `R${Math.floor(Math.random() * (category === 'Main Event' ? 5 : 3)) + 1}`;
                        time = `${Math.floor(Math.random() * 5)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;
                    } else {
                        method = 'SUB (Rear Naked Choke)';
                        round_end = `R${Math.floor(Math.random() * (category === 'Main Event' ? 5 : 3)) + 1}`;
                        time = `${Math.floor(Math.random() * 5)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;
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
                weight_class: WEIGHT_CLASSES[Math.floor(Math.random() * WEIGHT_CLASSES.length)] as any,
                rounds: category === 'Main Event' ? 5 : 3,
                is_title: category === 'Main Event' && Math.random() > 0.6,
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
        password: 'a',
        avatar_url: 'https://ui-avatars.com/api/?name=Andre&background=random',
        points: 0
    };
    users.push(adminUser);

    for (let i = 0; i < 30; i++) {
        const name = MOCK_NAMES[i % MOCK_NAMES.length];
        const sanitizedId = name.toLowerCase().replace(/\./g, '').replace(/\s/g, '_');

        // Cycle through 3 generic user images
        const imgIdx = (i % 3) + 1;

        users.push({
            id: sanitizedId,
            name: name,
            email: `${sanitizedId}@example.com`,
            password: 'password',
            avatar_url: `/assets/images/user_${imgIdx}.png`,
            points: 0
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
    private users: User[] = [...generatedUsers];
    private picks: Pick[] = [...generatedPicks];
    private currentUser: User | null = generatedUsers[0];

    constructor() {
        this.recalculateAllPoints();
    }

    private recalculateAllPoints() {
        const fightMap = new Map(this.fights.map(f => [f.id, f]));

        // Optimize: Group picks by fightId
        const picksByFight = new Map<string, Pick[]>();
        this.picks.forEach(p => {
            const list = picksByFight.get(p.fight_id) || [];
            list.push(p);
            picksByFight.set(p.fight_id, list);
        });

        picksByFight.forEach((picks, fightId) => {
            const fight = fightMap.get(fightId);
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

    private calculatePeriodDelta(pointsField: 'monthly_points' | 'yearly_points', deltaField: 'monthly_rank_delta' | 'yearly_rank_delta', lastEventId: string) {
        // Points including last event
        const currentPoints = this.users.map(u => ({ id: u.id, points: u[pointsField] || 0 }));
        const currentRankMap = this.getRankMap(currentPoints);

        // Optimize: Pre-calculate last event points for ALL users
        const lastEventPointsMap = new Map<string, number>();
        this.picks.filter(p => p.event_id === lastEventId).forEach(p => {
            const current = lastEventPointsMap.get(p.user_id) || 0;
            lastEventPointsMap.set(p.user_id, current + (p.points_earned || 0));
        });

        // Points excluding last event
        const previousPoints = this.users.map(u => {
            const lastEventPoints = lastEventPointsMap.get(u.id) || 0;
            return { id: u.id, points: (u[pointsField] || 0) - lastEventPoints };
        });
        const previousRankMap = this.getRankMap(previousPoints);

        this.users.forEach(u => {
            const curRank = currentRankMap[u.id];
            const prevRank = previousRankMap[u.id];
            u[deltaField] = prevRank - curRank;
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
        const fightPicks = picks || this.picks.filter(p => p.fight_id === fight.id);
        if (fightPicks.length === 0) return;

        const correctWinnerPicks = fightPicks.filter(p => p.fighter_id === fight.winner_id);
        const isMitada = correctWinnerPicks.length === 1;

        const isNonTitleMainEvent = fight.category === 'Main Event' && !fight.is_title;

        fightPicks.forEach(pick => {
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

    async getEvents(): Promise<Event[]> {
        await this.delay();
        return this.events.map(e => ({ ...e, status: this.calculateStatus(e) }));
    }

    async getEvent(id: string): Promise<Event | null> {
        await this.delay();
        const event = this.events.find(e => e.id === id);
        if (!event) return null;
        return { ...event, status: this.calculateStatus(event) };
    }

    async createEvent(event: Omit<Event, 'id'>): Promise<Event> {
        await this.delay();
        const newEventVal: Event = { ...event, id: `evt_${Date.now()}`, status: 'upcoming' };
        newEventVal.status = this.calculateStatus(newEventVal);
        this.events.push(newEventVal);
        return newEventVal;
    }

    async updateEvent(event: Event): Promise<Event> {
        await this.delay();
        const index = this.events.findIndex(e => e.id === event.id);
        if (index !== -1) {
            const updatedEvent = { ...event, status: this.calculateStatus(event) };
            this.events[index] = updatedEvent;
            return updatedEvent;
        }
        return event;
    }

    async deleteEvent(id: string): Promise<void> {
        await this.delay();
        this.events = this.events.filter(e => e.id !== id);
        this.fights = this.fights.filter(f => f.event_id !== id);
    }

    async getFights(eventId: string): Promise<Fight[]> {
        await this.delay();
        return this.fights.filter(f => f.event_id === eventId);
    }

    async createFight(fight: Fight): Promise<Fight> {
        await this.delay();
        const newFight = { ...fight, id: `fight_${Date.now()}` };
        this.fights.push(newFight);
        return newFight;
    }

    async updateFight(fight: Fight): Promise<Fight> {
        await this.delay();
        const index = this.fights.findIndex(f => f.id === fight.id);
        if (index !== -1) {
            this.fights[index] = fight;
            if (fight.winner_id) {
                const fightPicks = this.picks.filter(p => p.fight_id === fight.id);
                this.recalculatePointsForFightInternal(fight, fightPicks);

                const affectedUserIds = Array.from(new Set(fightPicks.map(p => p.user_id)));
                for (const userId of affectedUserIds) {
                    await this.recalculateUserPointsInternal(userId);
                }
                this.recalculateRanks();
            }
        }
        return fight;
    }

    async deleteFight(id: string): Promise<void> {
        await this.delay();
        this.fights = this.fights.filter(f => f.id !== id);
    }

    async getFighters(): Promise<Fighter[]> {
        await this.delay();
        return Object.values(this.fighters);
    }

    async createFighter(fighter: Omit<Fighter, 'id'>): Promise<Fighter> {
        await this.delay();
        const newFighter = { ...fighter, id: `fighter_${Date.now()}` };
        this.fighters[newFighter.id] = newFighter;
        return newFighter;
    }

    async getLeaderboard(period: RankingPeriod = 'all', periodId?: string): Promise<User[]> {
        await this.delay();

        let sortedUsers = [...this.users];

        if (periodId) {
            // For specifically requested periods (past events, specific months/years)
            // we calculate the score on the fly for those users based on picks
            const usersWithSpecificScore = this.users.map(u => {
                const userPicks = this.picks.filter(p => p.user_id === u.id);
                let score = 0;

                userPicks.forEach(pick => {
                    const pts = pick.points_earned || 0;
                    const event = this.events.find(e => e.id === pick.event_id);
                    if (!event) return;

                    if (period === 'week' && pick.event_id === periodId) {
                        score += pts;
                    } else if (period === 'month' && periodId) {
                        const eventDate = new Date(event.date);
                        const [y, m] = periodId.split('-').map(Number);
                        if (eventDate.getFullYear() === y && eventDate.getMonth() === (m - 1)) {
                            score += pts;
                        }
                    } else if (period === 'year' && periodId) {
                        const eventDate = new Date(event.date);
                        if (eventDate.getFullYear() === Number(periodId)) {
                            score += pts;
                        }
                    }
                });

                return {
                    ...u,
                    // Temporarily override the relevant points field for sorting
                    last_event_points: period === 'week' ? score : u.last_event_points,
                    monthly_points: period === 'month' ? score : u.monthly_points,
                    yearly_points: period === 'year' ? score : u.yearly_points,
                    points: period === 'all' ? score : u.points
                };
            });
            sortedUsers = usersWithSpecificScore;
        }

        if (period === 'month') {
            sortedUsers.sort((a, b) => (b.monthly_points || 0) - (a.monthly_points || 0));
        } else if (period === 'year' || period === 'all') {
            sortedUsers.sort((a, b) => (b.yearly_points || 0) - (a.yearly_points || 0));
        } else if (period === 'week') {
            sortedUsers.sort((a, b) => (b.last_event_points || 0) - (a.last_event_points || 0));
        }

        return sortedUsers.slice(0, 50);
    }

    async getPicksForEvent(eventId: string): Promise<Record<string, Pick>> {
        await this.delay();
        const userId = this.currentUser?.id || 'user_andre';
        const userPicks = this.picks.filter(p => p.event_id === eventId && p.user_id === userId);
        const picksMap: Record<string, Pick> = {};
        userPicks.forEach(p => picksMap[p.fight_id] = p);
        return picksMap;
    }

    async login(email: string, password: string): Promise<User | null> {
        await this.delay(500);

        const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        if (user) {
            this.currentUser = user;
            return user;
        }
        return null;
    }

    async getUser(id: string): Promise<User | null> {
        await this.delay(50);
        const user = this.users.find(u => u.id === id);
        return user || null;
    }

    async getAllPicksForEvent(eventId: string): Promise<Pick[]> {
        await this.delay();
        return this.picks.filter(p => p.event_id === eventId);
    }

    async updatePick(updatedPick: Pick): Promise<void> {
        await this.delay();
        const index = this.picks.findIndex(p => p.id === updatedPick.id);
        if (index !== -1) {
            this.picks[index] = updatedPick;
        } else {
            this.picks.push(updatedPick);
        }
        await this.recalculateUserPointsInternal(updatedPick.user_id);
        this.recalculateRanks();
    }

    private async recalculateUserPointsInternal(userId: string): Promise<void> {
        const userPicks = this.picks.filter(p => p.user_id === userId);

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

        userPicks.forEach(pick => {
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
                last_event_points: lastEventPoints,
                monthly_points: monthlyPoints,
                yearly_points: yearlyPoints
            };
        }
    }
}
