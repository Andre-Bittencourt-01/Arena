import { IFightRepository } from "../../../domain/repositories/IFightRepository.js";

interface UpdateFightRequest {
    id: string;
    eventId: string;
    fighterAId: string;
    fighterBId: string;
    rounds: number;
    isTitle: boolean;
    category: string;
    winnerId?: string | null;
    result?: string | null;
    method?: string | null;
    roundEnd?: number | null;
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

        // Map domain fields (camelCase) to DB fields (snake_case)
        await this.fightRepository.update(data.id, {
            event_id: data.eventId,
            fighter_a_id: data.fighterAId,
            fighter_b_id: data.fighterBId,
            rounds: data.rounds,
            is_title: data.isTitle,
            category: data.category,
            winner_id: data.winnerId || null,
            result: (data.result as any) || null,
            method: data.method || null,
            round_end: data.roundEnd ? String(data.roundEnd) : null,
            time: data.time || null,
            status: (data.status as any) || "SCHEDULED",
            order: data.order
        });
    }
}
