import { LeagueMember } from "@prisma/client";

export interface League {
    id: string;
    name: string;
    description: string | null;
    invite_code: string;
    logo_url: string | null;
    is_system: boolean;
    created_at: Date;
    owner_id: string;
    members?: LeagueMember[];
}
