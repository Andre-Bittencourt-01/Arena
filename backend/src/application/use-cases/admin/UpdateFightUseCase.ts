import { IFightRepository } from "../../../domain/repositories/IFightRepository.js";

// Ensure Interface includes all fields needed
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
    winner_id?: string | null;
    result?: string | null;
    method?: string | null;
    round_end?: number | null;
    time?: string | null;
    points?: number;
    lock_status?: string;
    custom_lock_time?: string | Date | null;
}

export class UpdateFightUseCase {
    constructor(private fightRepository: IFightRepository) { }

    async execute(data: UpdateFightRequest): Promise<void> {
        // 1. Fetch current fight WITH Event data to check cascade settings
        const currentFight = await this.fightRepository.findByIdWithEvent(data.id);
        if (!currentFight) throw new Error("Fight not found");

        let finalCustomLockTime = data.custom_lock_time;
        let finalLockStatus = data.lock_status;

        // 2. SMART LOGIC: Did the user just UNLOCK this fight?
        // If passing 'OPEN' (or 'cascade' equivalent) AND the event has a cascade_start_time...
        const isUnlocking = (data.lock_status === 'OPEN' || data.lock_status === 'cascade');
        const eventHasCascade = currentFight.event && currentFight.event.cascade_start_time;

        if (isUnlocking && eventHasCascade && !data.custom_lock_time) {
            console.log(`[CASCADE] Auto-restoring cascade time for Fight ${data.id}`);

            const startTime = new Date(currentFight.event.cascade_start_time!);

            // Use new order if provided, else current
            const orderToUse = (data.order !== undefined) ? data.order : currentFight.order;

            // Math
            const orderIndex = (orderToUse && orderToUse > 0) ? orderToUse - 1 : 0;
            const minutesToAdd = orderIndex * 30;

            // Overwrite the empty time with the calculated cascade time
            finalCustomLockTime = new Date(startTime.getTime() + minutesToAdd * 60000);

            // Force status to OPEN so the scheduler picks it up
            finalLockStatus = 'OPEN';
        }

        // 3. Save to Repository
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
            winner_id: data.winner_id || null,
            result: (data.result as any) || null,
            method: data.method || null,
            round_end: data.round_end ? String(data.round_end) : null,
            time: data.time || null,

            // Betting Fields (with smart logic applied)
            points: data.points,
            lock_status: finalLockStatus,
            custom_lock_time: finalCustomLockTime as any
        });
    }
}
