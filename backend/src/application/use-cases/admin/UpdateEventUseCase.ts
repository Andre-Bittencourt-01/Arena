import { IEventRepository } from "../../../domain/repositories/IEventRepository.js";
import { IFightRepository } from "../../../domain/repositories/IFightRepository.js";

interface UpdateEventDTO {
    id: string;
    title?: string;
    description?: string;
    date?: Date | string;
    status?: string;
    lock_status?: string;
    lock_time?: Date | string;
    cascade_start_time?: Date | string | null;
}

export class UpdateEventUseCase {
    constructor(
        private eventRepository: IEventRepository,
        private fightRepository: IFightRepository
    ) { }

    async execute(data: UpdateEventDTO) {
        // 1. Normalize status for Prisma
        if (data.lock_status) data.lock_status = data.lock_status.toUpperCase();

        // 2. Clear cascade date if opening event
        if (data.lock_status === 'OPEN') data.cascade_start_time = null;

        // 3. Update Event
        const event = await this.eventRepository.update(data.id, data as any);

        // 4. Sync Fights Logic
        const fights = await this.fightRepository.findByEventId(data.id);

        if (data.lock_status === 'OPEN') {
            await Promise.all(fights.map(f => {
                if (!['LOCKED', 'CLOSED'].includes((f.lock_status || '').toUpperCase())) {
                    return this.fightRepository.update(f.id, { custom_lock_time: null, lock_status: 'OPEN' } as any);
                }
            }));
        } else if (data.lock_status === 'SCHEDULED' && data.lock_time) {
            await Promise.all(fights.map(f => {
                if (!['LOCKED', 'CLOSED'].includes((f.lock_status || '').toUpperCase())) {
                    return this.fightRepository.update(f.id, { custom_lock_time: data.lock_time, lock_status: 'OPEN' } as any);
                }
            }));
        }

        // 5. Cascade Logic (Only if status is CASCADE)
        if (data.cascade_start_time && data.lock_status === 'CASCADE') {
            console.log(`[CASCADE] Recalculating full card for Event: ${data.id}`);

            const startTime = new Date(data.cascade_start_time);

            // Sort explicitly by Order
            fights.sort((a, b) => (a.order || 0) - (b.order || 0));

            // Pool loop logic
            for (let i = 0; i < fights.length; i++) {
                const fight = fights[i];

                if (['LOCKED', 'CLOSED'].includes((fight.lock_status || '').toUpperCase())) {
                    continue;
                }

                const dbOrder = fight.order;
                const effectiveOrder = (dbOrder && dbOrder > 0) ? dbOrder : (i + 1);
                const minutesToAdd = (effectiveOrder - 1) * 30;
                const newLockTime = new Date(startTime.getTime() + minutesToAdd * 60000);

                await this.fightRepository.update(fight.id, {
                    custom_lock_time: newLockTime,
                    lock_status: 'OPEN'
                } as any);
            }
        }
        return event;
    }
}
