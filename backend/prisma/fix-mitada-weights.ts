
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const EVENT_ID = 'evt_ufc_seed_7631';
const MAJORITY_USERS = Array.from({ length: 9 }, (_, i) => `test0${i + 1}@arenamma.app`); // test01...test09
const MINORITY_USER = 'test10@arenamma.app';

// Helper for finding users
async function getUserId(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    return user?.id;
}

async function main() {
    console.log(`🔧 Adjusting Weights for Mitada Simulation on Event: ${EVENT_ID}`);

    // 1. Get Event & First Fight
    const event = await prisma.event.findUnique({
        where: { id: EVENT_ID },
        include: { fights: { orderBy: { order: 'asc' }, take: 1 } }
    });

    if (!event || event.fights.length === 0) {
        throw new Error(`Event or Fights not found for ${EVENT_ID}`);
    }

    const fight = event.fights[0];
    console.log(`Target Fight: ${fight.id} (${fight.fighter_a_id} vs ${fight.fighter_b_id})`);

    const fighterA = fight.fighter_a_id;
    const fighterB = fight.fighter_b_id;

    // 2. Force Majority (9 votes for Fighter A)
    for (const email of MAJORITY_USERS) {
        const userId = await getUserId(email);
        if (!userId) {
            console.warn(`User ${email} not found.`);
            continue;
        }

        // Update pick (preserve other fields)
        await prisma.pick.updateMany({
            where: {
                user_id: userId,
                fight_id: fight.id
            },
            data: {
                fighter_id: fighterA // Force A
            }
        });
    }

    // 3. Force Minority (1 vote for Fighter B)
    const minorityUserId = await getUserId(MINORITY_USER);
    if (minorityUserId) {
        await prisma.pick.updateMany({
            where: {
                user_id: minorityUserId,
                fight_id: fight.id
            },
            data: {
                fighter_id: fighterB // Force B
            }
        });
    } else {
        console.warn(`User ${MINORITY_USER} not found.`);
    }

    console.log(`\n✅ Luta ${fight.id} ajustada: 9 votos para Lutador A, 1 voto para Lutador B`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
