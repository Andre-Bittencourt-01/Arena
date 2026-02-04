import { IFightRepository } from "../../../domain/repositories/IFightRepository.js";

interface UpdateFightRequest {
    id: string;
    event_id: string;
    fighter_a_id: string;
    fighter_b_id: string;
    rounds: number;
    is_title: boolean;
    category: string;
    weight_class?: string;
    video_url?: string;
    status?: string;
    order?: number;

    // Results
    winner_id?: string | null;
    result?: string | null;
    method?: string | null;
    round_end?: number | null;
    time?: string | null;

    // Betting System
    points?: number;
    lock_status?: string;
    custom_lock_time?: string | Date;
}

export class UpdateFightUseCase {
    constructor(private fightRepository: IFightRepository) { }

    async execute(data: UpdateFightRequest): Promise<void> {
        const fight = await this.fightRepository.findByIdWithEvent(data.id);

        if (!fight) {
            throw new Error("Fight not found");
        }

        // FIX: Passing ALL fields to the repository
        await this.fightRepository.update(data.id, {
            event_id: data.event_id,
            fighter_a_id: data.fighter_a_id,
            fighter_b_id: data.fighter_b_id,
            category: data.category,
            weight_class: data.weight_class,
            rounds: data.rounds,
            status: data.status,
            order: data.order,
            video_url: data.video_url,
            is_title: data.is_title,

            // Results
            winner_id: data.winner_id || null,
            result: (data.result as any) || null,
            method: data.method || null,
            round_end: data.round_end ? String(data.round_end) : null,
            time: data.time || null,

            // Betting Fields (Crucial Fix)
            points: data.points,
            lock_status: data.lock_status,
            custom_lock_time: data.custom_lock_time
        });
    }
}
