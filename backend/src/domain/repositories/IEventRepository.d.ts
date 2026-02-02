import { Event, Fight } from "@prisma/client";
export interface IEventRepository {
    findUpcoming(): Promise<(Event & {
        fights: Fight[];
    })[]>;
    findById(id: string): Promise<Event | null>;
}
