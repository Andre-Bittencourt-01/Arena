import { IDataService } from './types';
import { Event, Fight, Fighter, User, Pick } from '../types';

// --- Constants & Helpers ---

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

const initialFighters: Record<string, Fighter> = {
    'omally': { id: 'omally', name: "Sean O'Malley", nickname: "Suga", image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuA3IRQha8n77KLDV0WzOA4olQxonShActFOXs5yazG1ixoRPnmRutcox7D4uPTVjBjzNF7o-j35uiE7InRiST6WYYrFnQVlOvbNMC4rIenFG5B7tEOdgS5q_g1NXhyDxWPulWy0WkCqlL7hDdjt1klmHW7RfK2y0IxH0XqTY0_qUx0hGdng9PpF8IcS5qF2KaF2NQhdty3zqZb6f7Cb861du0ik2jM-IrKDkB4ky0pw7KEX8versByc1qYfOvcU9f_hMphq9GRoUHa8", wins: 17, losses: 1, draws: 0, nc: 0 },
    'vera': { id: 'vera', name: "Marlon Vera", nickname: "Chito", image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuADYyB70cnUW8i9Pjx9MLu8vAuG8Jz51kqMdOLfuqDyufWvn_kX0ZtzXCyOqO77Jpmioo65PH4Vdbwd2OyZATgcYEW2TsY4WRQJS8voi1lEYcWf1K8cKHyyUxyuGSbBnwTzCE3FAJXkjmBvOtl_IX96Vv4ej-_P4coQfv-msxG9HdyJQjUvEJxt9U_9yLrWk2BVYJl5xsToT2awspqn0a3wzXBHrUUOttcK8fQoDgjfOtZja3O-cJCQBskQNWa9aTNJ7j5AgweyuTnZ", wins: 23, losses: 8, draws: 1, nc: 0 },
    'poirier': { id: 'poirier', name: "Dustin Poirier", nickname: "The Diamond", image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCybeXJ_ygQE_hrbXYk11pabc21j43ny6cHAetfznwuUm-jmlNftMO3qaUjbCSY51YmwBZXzhRcxh3sNeDDwUErJjPqKyftS4SsleS5gbpK27yuxS_CZ3LS5eWwkkJnyfPcjenqjkMMJMxspH7Z8tnDeuSJJTDPOo2joj6NVoGZYoLfWYreA3Byte4O-sKwih41hTb49cS1J4ZTO69NNHNlR8uxhRx0rN0-Cc7XxBgGkgt-0E3nRj39GVWUdLpICU5kxYT4ezLt4xnR", wins: 29, losses: 8, draws: 0, nc: 0 },
    'saintdenis': { id: 'saintdenis', name: "Benoit Saint Denis", nickname: "God of War", image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuB6N8NWBknCaO1Ey0PfW9TUBeqO6uU9IyUBv2UOv4mDkE_Ksqm8Jp7x5HwXIBIkWDmNqo64-pM9HJDitXgozIeEuBN2dFKbJ7dyyI3jXGpoQ9aO4bsFELWaKUOeDpnPIR1UXfps-2rkxba8jT_4AX73H-kGmwN57BY7QASrGKusJ0WaCxSf0KHM_a8PQmRIZCfPVZxLH4AVdpAZ4roDdXPOKR33N1X3jFnf6I0k9oCVVwSTmzDZi9OXVs7P4QWKcAj7yOUxnIqJfBsQ", wins: 13, losses: 1, draws: 0, nc: 0 }
};

const initialEvents: Event[] = [
    {
        id: 'evt_ufc315',
        title: 'UFC 315',
        subtitle: 'Oliveira vs Gaethje 2',
        date: '2025-06-15T19:00:00',
        end_date: '2025-06-16T03:00:00',
        location: 'São Paulo, Brasil',
        banner_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD3frgPNFP4IJ06mcTS-uCpzSkETqvBkGGSKGVpOag4hr4JfgwkrbvzhtCrsuFjM_BpLaWGg0NmxmNTNdLOREbTDuTtOcM9A-h1aXbw-8r5PEV9Vyg6g68LvevlYzdbIZ0O6QVZdlCbEAaj1LU2CU2e5tp2fwgoaBmyyk3204MHt8bNJPiccia-0fiCjNEj4t3zIOXH1_KmQlh3iFc5-1ojBQ96Z_-WX_eY2jy9nq_EGOyLtztYYvJidlg2v1VY0a6uZL6xbdfaQFiT',
        status: 'completed'
    },
    {
        id: 'evt_ufc320',
        title: 'UFC 320',
        subtitle: 'Makhachev vs Volkanovski 3',
        date: '2025-11-20T18:00:00',
        end_date: '2025-11-21T02:00:00',
        location: 'Abu Dhabi, UAE',
        banner_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfucuAO00sbi3ih6JvIl869557kzBYOJAzDX50t47vJGJJsLQs9nGZG7ihrlNEJbvlmNHhPe9yZJhmFNMbMR0pblHUkAFLAkj40nBZ_BYOcN6HrQJ2cKPiVZI-Jx1u6EKjNAfRFi_wwRz4av6M48CoV0p21kRkh590rT4BaB8dR6rlJN12m26r-XDqbBqd6EqIrOc6ZhOfQezDRaVIh0hDcH7k6JAQ5CQzCDWdWdALMzf9Ci7Tnj4pQba49kKGzU2sf78XtzF-_7om',
        status: 'completed'
    },
    {
        id: 'evt_ufc330',
        title: 'UFC 330',
        subtitle: 'Pereira vs Ankalaev',
        date: '2026-01-31T19:00:00',
        end_date: '2026-02-01T03:00:00',
        location: 'Las Vegas, EUA',
        banner_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfucuAO00sbi3ih6JvIl869557kzBYOJAzDX50t47vJGJJsLQs9nGZG7ihrlNEJbvlmNHhPe9yZJhmFNMbMR0pblHUkAFLAkj40nBZ_BYOcN6HrQJ2cKPiVZI-Jx1u6EKjNAfRFi_wwRz4av6M48CoV0p21kRkh590rT4BaB8dR6rlJN12m26r-XDqbBqd6EqIrOc6ZhOfQezDRaVIh0hDcH7k6JAQ5CQzCDWdWdALMzf9Ci7Tnj4pQba49kKGzU2sf78XtzF-_7om',
        status: 'upcoming'
    },
    {
        id: 'evt_ufc331',
        title: 'UFC 331',
        subtitle: 'Jones vs Aspinall',
        date: '2026-02-07T18:00:00',
        end_date: '2026-02-08T02:00:00',
        location: 'Londres, Reino Unido',
        banner_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfucuAO00sbi3ih6JvIl869557kzBYOJAzDX50t47vJGJJsLQs9nGZG7ihrlNEJbvlmNHhPe9yZJhmFNMbMR0pblHUkAFLAkj40nBZ_BYOcN6HrQJ2cKPiVZI-Jx1u6EKjNAfRFi_wwRz4av6M48CoV0p21kRkh590rT4BaB8dR6rlJN12m26r-XDqbBqd6EqIrOc6ZhOfQezDRaVIh0hDcH7k6JAQ5CQzCDWdWdALMzf9Ci7Tnj4pQba49kKGzU2sf78XtzF-_7om',
        status: 'upcoming'
    },
    {
        id: 'evt_ufc332',
        title: 'UFC 332',
        subtitle: 'Pantoja vs Royval 3',
        date: '2026-02-08T20:00:00',
        end_date: '2026-02-09T04:00:00',
        location: 'Rio de Janeiro, Brasil',
        banner_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfucuAO00sbi3ih6JvIl869557kzBYOJAzDX50t47vJGJJsLQs9nGZG7ihrlNEJbvlmNHhPe9yZJhmFNMbMR0pblHUkAFLAkj40nBZ_BYOcN6HrQJ2cKPiVZI-Jx1u6EKjNAfRFi_wwRz4av6M48CoV0p21kRkh590rT4BaB8dR6rlJN12m26r-XDqbBqd6EqIrOc6ZhOfQezDRaVIh0hDcH7k6JAQ5CQzCDWdWdALMzf9Ci7Tnj4pQba49kKGzU2sf78XtzF-_7om',
        status: 'upcoming'
    }
];

const generateFightersAndFights = () => {
    let fighters: Record<string, Fighter> = { ...initialFighters };
    let fights: Fight[] = [];

    // Helper to get or create fighter
    const getFighter = (name: string): Fighter => {
        const id = name.toLowerCase().replace(/\s/g, '');
        if (!fighters[id]) {
            fighters[id] = {
                id,
                name,
                nickname: 'The ' + name.split(' ')[0], // Simple mock nickname
                image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDdv6fnH2aUkUnStYycJnEKhaBICr74VmX4NnJNWQeAiTlNYjfRaYYdIaoUwqoIEjja3cV-obJrnb8Gr2KiHkzQz-DeJP1i1-21wlLJCmCXKcRBgb6F2m-uUznPWRZzMhZNCqAZa6eSt2I623-0Z_DFPK5NPmKdViNtogczjn5ZtJ-ArZKYBj2bztA5emkHyNyEy2LqUPyIDFtazLxIRtXY1YTN904jPv1NkVDpSRAx_bnPSnUrqaadV4tkE7fo8AizW2OjfaNetD1y",
                wins: Math.floor(Math.random() * 30),
                losses: Math.floor(Math.random() * 10),
                draws: Math.floor(Math.random() * 3),
                nc: 0
            };
        }
        return fighters[id];
    };

    initialEvents.forEach(event => {
        for (let i = 0; i < 15; i++) {
            // Pick 2 random fighters from list (ensure unique pair per fight)
            const idx1 = Math.floor(Math.random() * MOCK_NAMES.length);
            let idx2 = Math.floor(Math.random() * MOCK_NAMES.length);
            while (idx1 === idx2) idx2 = Math.floor(Math.random() * MOCK_NAMES.length);

            const f1 = getFighter(MOCK_NAMES[idx1]);
            const f2 = getFighter(MOCK_NAMES[idx2]);

            // Determine category
            let category: Fight['category'] = 'Prelim';
            if (i === 0) category = 'Main Event';
            else if (i === 1) category = 'Co-Main';
            else if (i < 5) category = 'Main Card';
            else if (i < 10) category = 'Prelim';
            else category = 'Early';

            // Determine winner randomly for completed events
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
                    rounds: 3; // usually decisions go full rounds
                    round_end = `R${category === 'Main Event' ? 5 : 3}`;
                    time = '5:00';
                } else {
                    result = 'win';
                    winner = Math.random() > 0.5 ? f1 : f2;
                    const methodRand = Math.random();
                    if (methodRand > 0.6) {
                        method = 'DEC (Unanimous)';
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
                winner_id: winner?.id,
                result,
                method,
                round_end,
                time,
                points: category === 'Main Event' ? 50 : 25
            });
        }
    });

    return { fighters, fights };
};

const generateUsersAndPicks = (fights: Fight[]) => {
    const users: User[] = [];
    const picks: Pick[] = [];

    // Create Admin User (André)
    const adminUser: User = {
        id: 'user_andre',
        name: 'André',
        email: 'andre@arena.com', // Mock email
        password: 'a',
        avatar_url: 'https://ui-avatars.com/api/?name=Andre&background=random',
        points: 0
    };
    users.push(adminUser);

    // Create 30 random participants
    for (let i = 0; i < 30; i++) {
        const name = MOCK_NAMES[i % MOCK_NAMES.length]; // Reuse names for simplicity
        users.push({
            id: `user_${i}`,
            name: name,
            email: `${name.toLowerCase().replace(/\s/g, '.')}@example.com`,
            password: 'password',
            avatar_url: `https://ui-avatars.com/api/?name=${name.replace(/\s/g, '+')}&background=random`,
            points: 0
        });
    }

    // Generate Picks for ALL users for ALL fights
    users.forEach(user => {
        let userTotalPoints = 0;

        fights.forEach(fight => {
            // Find the event status
            const event = initialEvents.find(e => e.id === fight.event_id);
            if (event && event.status === 'completed') {
                // Determine pick
                let selectedFighterId: string;
                const randomWin = Math.random();
                if (randomWin > 0.5) {
                    selectedFighterId = fight.fighter_a_id;
                } else {
                    selectedFighterId = fight.fighter_b_id;
                }

                // Randomize Method and Round pick
                const methods: ('KO/TKO' | 'SUB' | 'DEC')[] = ['KO/TKO', 'SUB', 'DEC'];
                const randomMethod = methods[Math.floor(Math.random() * methods.length)];

                let randomRound = '';
                if (randomMethod === 'DEC') {
                    randomRound = Math.random() > 0.5 ? 'Unanimous' : 'Split';
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

                // Calculate points
                if (fight.winner_id && fight.winner_id === selectedFighterId) {
                    pick.points_earned! += 3; // Level 1: Winner

                    // Normalize method strings for comparison (mock data uses verbose strings like "KO/TKO (Punch)")
                    const fightMethodBase = fight.method?.split(' ')[0]; // "KO/TKO", "SUB", "DEC"

                    if (fightMethodBase && fightMethodBase.includes(randomMethod)) {
                        pick.points_earned! += 2; // Level 2: Method

                        // Level 3: Round or Decision Type
                        if (randomMethod === 'DEC') {
                            // Check "Unanimous" or "Split" inside parentheses of fight.method, e.g., "DEC (Unanimous)"
                            if (fight.method?.includes(randomRound)) {
                                pick.points_earned! += 1;
                            }
                        } else {
                            // Check Exact Round
                            if (fight.round_end === randomRound) {
                                pick.points_earned! += 1;
                            }
                        }
                    }
                    userTotalPoints += pick.points_earned!;
                }

                picks.push(pick);
            }
        });

        user.points = userTotalPoints;
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
    private currentUser: User | null = generatedUsers[0]; // Default to André for validation

    private async delay(ms: number = 300) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private calculateStatus(event: Event): Event['status'] {
        const now = new Date();
        const start = new Date(event.date);
        // Fallback to start + 8h if end_date is missing (though our UI enforces it now)
        const end = event.end_date ? new Date(event.end_date) : new Date(start.getTime() + 8 * 60 * 60 * 1000);

        if (now > end) {
            return 'completed';
        } else if (now >= start && now <= end) {
            return 'live';
        } else {
            return 'upcoming';
        }
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
        // Create with temporary status, but calculateStatus will override strictly based on dates
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
        // Cascade delete fights
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

    async getPicks(eventId: string): Promise<Record<string, Pick>> {
        await this.delay();

        // For now, return picks for the default user (André) to populate the UI
        const userId = this.currentUser?.id || 'user_andre';

        const userPicks = this.picks.filter(p => p.event_id === eventId && p.user_id === userId);
        const picksMap: Record<string, Pick> = {};

        userPicks.forEach(p => {
            picksMap[p.fight_id] = p;
        });

        return picksMap;
    }
}
