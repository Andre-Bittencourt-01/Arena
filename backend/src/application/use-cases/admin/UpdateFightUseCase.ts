import { IFightRepository } from "../../../domain/repositories/IFightRepository.js";

interface UpdateFightRequest {
    id: string;
    event_id: string;
    fighter_a_id: string;
    fighter_b_id: string;
    rounds: number;
    is_title: boolean;
    category: string;
    winner_id?: string | null;
    result?: string | null;
    method?: string | null;
    round_end?: number | null;
    time?: string | null;
    status?: string;
    order?: number;
}

export class UpdateFightUseCase {
    constructor(private fightRepository: IFightRepository) { }

    async execute(data: UpdateFightRequest): Promise<void> {
        const fight = await this.fightRepository.findByIdWithEvent(data.id);

        if (!fight) {
            throw new Error("Fight not found");
        }

        // Map domain fields (snake_case) to DB fields (snake_case)
        await this.fightRepository.update(data.id, {
            event_id: data.event_id,
            fighter_a_id: data.fighter_a_id,
            fighter_b_id: data.fighter_b_id,
            rounds: data.rounds,
            is_title: data.is_title,
            category: data.category,
            winner_id: data.winner_id || null,
            result: (data.result as any) || null,
            method: data.method || null,
            round_end: data.round_end ? String(data.round_end) : null,
            time: data.time || null
        });
    }
}
