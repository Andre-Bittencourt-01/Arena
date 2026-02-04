import { IEventRepository } from '../../repositories/IEventRepository.js';
import { prisma } from '../../../infrastructure/database/client.js';

export class DeleteEventUseCase {
    constructor(private eventRepository: IEventRepository) { }

    async execute(id: string): Promise<void> {
        // 1. Validate if event exists
        const event = await this.eventRepository.findById(id);
        if (!event) {
            throw new Error("Event not found");
        }

        // 2. Cascade Delete Manually (Since schema does not support ON DELETE CASCADE)
        // Order: Picks -> Fights -> Event

        // Delete all picks related to this event
        await prisma.pick.deleteMany({
            where: { event_id: id }
        });

        // Delete all fights related to this event
        await prisma.fight.deleteMany({
            where: { event_id: id }
        });

        // 3. Delete the event
        await this.eventRepository.delete(id);
    }
}
