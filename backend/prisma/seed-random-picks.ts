
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const EVENT_ID = 'evt_ufc_seed_7631';
const USERS_RANGE: [number, number] = [1, 10]; // test01 to test10

// Helper to pad numbers (e.g. 1 -> "01")
const pad = (n: number) => n.toString().padStart(2, '0');

// Possible Pick Types
const METHODS = ['KO/TKO', 'SUB', 'DEC'];
const DECISION_TYPES = ['UNÂNIME', 'DIVIDIDA', 'MAJORIT.'];

async function main() {
    console.log(`🚀 Starting Picks Seeding for Event: ${EVENT_ID}`);

    // 1. Fetch Event & Fights
    const event = await prisma.event.findUnique({
        where: { id: EVENT_ID },
        include: { fights: true }
    });

    if (!event) {
        throw new Error(`Event ${EVENT_ID} not found!`);
    }

    console.log(`Found event: ${event.title} with ${event.fights.length} fights.`);

    // 2. Iterate Users
    for (let i = USERS_RANGE[0]; i <= USERS_RANGE[1]; i++) {
        const userEmail = `test${pad(i)}@arenamma.app`;
        const user = await prisma.user.findUnique({ where: { email: userEmail } });

        if (!user) {
            console.warn(`User ${userEmail} not found. Skipping.`);
            continue;
        }

        console.log(`\nGenerating picks for: ${user.name} (${userEmail})`);

        // 3. Generate Picks for Each Fight
        for (const fight of event.fights) {
            // A. Choose Winner (50/50)
            const winnerId = Math.random() > 0.5 ? fight.fighter_a_id : fight.fighter_b_id;

            // B. Choose Method
            const method = METHODS[Math.floor(Math.random() * METHODS.length)];

            // C. Logic for Round vs Type
            let round = '';

            if (method === 'DEC') {
                // Decision: Round is "Decision Type" (based on current frontend logic)
                round = DECISION_TYPES[Math.floor(Math.random() * DECISION_TYPES.length)];
            } else {
                // Finish: Round 1 to Max Rounds (default 3 or 5)
                const maxRounds = fight.rounds || 3;
                const r = Math.floor(Math.random() * maxRounds) + 1;
                round = `R${r}`;
            }

            // D. Persist Pick
            const pick = await prisma.pick.upsert({
                where: {
                    user_id_fight_id: {
                        user_id: user.id,
                        fight_id: fight.id
                    }
                },
                update: {
                    fighter_id: winnerId,
                    method: method,
                    round: round,
                    event_id: EVENT_ID // Ensure redundancy field is set
                },
                create: {
                    user_id: user.id,
                    fight_id: fight.id,
                    event_id: EVENT_ID,
                    fighter_id: winnerId,
                    method: method,
                    round: round
                }
            });

            process.stdout.write('.'); // Progress dot
        }
    }
    console.log('\n\n✅ Seeding Complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
