export type WeightClass = 'Galo' | 'Mosca' | 'Leve' | 'Médio' | 'Pesado' | 'M. Pesado' | 'Catch';
export type FightCategory = 'Main Event' | 'Co-Main' | 'Main Card' | 'Prelim' | 'Early';

export interface Fighter {
    id: string;
    name: string;
    nickname?: string;
    image_url: string;
    wins: number;
    losses: number;
    draws: number;
    nc: number;
}

export interface Fight {
    id: string;
    event_id: string;
    fighter_a_id: string;
    fighter_b_id: string;
    winner_id?: string;

    // Denormalized for simpler UI
    fighter_a: Fighter;
    fighter_b: Fighter;

    category: FightCategory;
    weight_class: WeightClass;
    rounds: number;
    is_title?: boolean; // New property for custom scoring

    // Results
    result?: 'win' | 'draw' | 'nc'; // Status of the result
    method?: string;
    round_end?: string;
    time?: string; // Time round ended (e.g., "4:59")
    points: number; // Potential points for picking this fight correctly
}

export interface Event {
    id: string;
    title: string;
    subtitle: string;
    date: string;
    end_date?: string;
    location: string;
    banner_url: string;
    status: 'upcoming' | 'live' | 'completed';
}

export interface User {
    id: string;
    name: string;
    email: string;
    password?: string; // In a real app, hash this. Mocking "a" for now.
    avatar_url: string;
    points: number;
    last_event_points?: number;
    monthly_points?: number;
    yearly_points?: number;
    monthly_rank_delta?: number; // Positive = climbed, Negative = dropped
    yearly_rank_delta?: number;
}

export interface Pick {
    id: string;
    user_id: string;
    event_id: string;
    fight_id: string;
    fighter_id: string; // The fighter picked to win
    method?: 'KO/TKO' | 'SUB' | 'DEC';
    round?: string; // "R1", "R2", "R3"... or "Unanimous", "Split"
    points_earned?: number;
    admin_note?: string; // Reason for manual point adjustment
}
