import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const eventTitle = "UFC Seed 6587";
    console.log(`🔍 Searching for event: ${eventTitle}...`);

    const event = await prisma.event.findFirst({
        where: { title: { contains: eventTitle } },
        include: { fights: true }
    });

    if (!event) {
        console.error(`❌ Event "${eventTitle}" not found! Please create it first.`);
        return;
    }
    console.log(`✅ Found event: ${event.title} (${event.id}) with ${event.fights.length} fights.`);

    const users = await prisma.user.findMany();
    console.log(`👥 Found ${users.length} users to generate picks for.`);

    let pickCount = 0;

    for (const user of users) {
        // Optional: Skip admin or specific users if needed
        // if (user.email === 'admin@arena.com') continue;

        for (const fight of event.fights) {
            if (!fight.fighter_a_id || !fight.fighter_b_id) continue;

            // Randomize Winner
            const fighters = [fight.fighter_a_id, fight.fighter_b_id];
            const randomWinner = fighters[Math.floor(Math.random() * fighters.length)];

            // Randomize Method & Round
            const methods = ["KO/TKO", "SUB", "DEC"]; // Enumerated values from schema usually
            const randomMethod = methods[Math.floor(Math.random() * methods.length)];

            // Round logic: Valid rounds 1-5. If DEC, round usually doesn't matter or is null/specific.
            // Schema likely has String or Int for round. Based on snippet: "1", "2", "3".
            // Picks.tsx uses string rounds.
            const randomRound = randomMethod === "DEC" ? "3" : (Math.floor(Math.random() * 3) + 1).toString();

            // Delete existing to allow re-run (Upsert logic via delete/create)
            await prisma.pick.deleteMany({
                where: { user_id: user.id, fight_id: fight.id }
            });

            await prisma.pick.create({
                data: {
                    user_id: user.id,
                    fight_id: fight.id,
                    fighter_id: randomWinner, // Note: Schema uses `fighter_id` not `winner_id` for Pick?
                    method: randomMethod, // Check enum mapping
                    round: randomRound,
                    event_id: event.id,
                    points_earned: 0
                }
            });
            pickCount++;
        }
    }

    console.log(`🚀 Successfully seeded ${pickCount} picks!`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
