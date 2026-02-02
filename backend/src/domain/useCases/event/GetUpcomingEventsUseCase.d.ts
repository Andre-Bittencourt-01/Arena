import { IEventRepository } from '../../repositories/IEventRepository.js';
export declare class GetUpcomingEventsUseCase {
    private eventRepository;
    constructor(eventRepository: IEventRepository);
    execute(): Promise<({
        id: string;
        title: string;
        subtitle: string | null;
        date: Date;
        location: string | null;
        banner_url: string | null;
        status: import(".prisma/client").$Enums.EventStatus;
        lock_status: import(".prisma/client").$Enums.LockStatus;
    } & {
        fights: import(".prisma/client").Fight[];
    })[]>;
}
