
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const eventTitle = "UFC Seed 6587";
    const userName = "Test User 01";

    console.log(`🔍 Searching for event: ${eventTitle}...`);
    const event = await prisma.event.findFirst({
        where: { title: { contains: eventTitle } },
        include: {
            fights: {
                include: {
                    fighter_a: true,
                    fighter_b: true,
                    winner: true
                },
                orderBy: { order: 'asc' }
            }
        }
    });

    if (!event) {
        console.error(`❌ Event "${eventTitle}" not found!`);
        return;
    }

    console.log(`🔍 Searching for user: ${userName}...`);
    const user = await prisma.user.findFirst({
        where: {
            OR: [
                { name: { contains: userName } },
                { email: { contains: userName } }
            ]
        }
    });

    if (!user) {
        console.error(`❌ User "${userName}" not found!`);
        return;
    }

    const picks = await prisma.pick.findMany({
        where: { user_id: user.id, event_id: event.id },
        include: { fighter: true }
    });

    let totalEventPoints = 0;
    const grid = [];

    for (const fight of event.fights) {
        const pick = picks.find(p => p.fight_id === fight.id);

        const nameA = fight.fighter_a?.name || 'TBD';
        const nameB = fight.fighter_b?.name || 'TBD';
        const fightLabel = `${nameA} vs ${nameB}`;

        if (!pick) {
            grid.push({ fight: fightLabel, pick: '-', result: '-', win: 0, met: 0, rnd: 0, bon: 0, tot: 0, sum: totalEventPoints });
            continue;
        }

        let ptsWinner = 0;
        let ptsMethod = 0;
        let ptsRound = 0;
        let ptsBonus = 0;

        const isWinnerCorrect = fight.winner_id && pick.fighter_id === fight.winner_id;

        if (isWinnerCorrect) {
            ptsWinner = 30;
            if (fight.is_title) ptsBonus += 60;
            else if (fight.category === 'Main Event') ptsBonus += 30;

            if (pick.method?.toUpperCase() === fight.method?.toUpperCase()) {
                ptsMethod = 20;
                if (String(pick.round) === String(fight.round_end)) {
                    ptsRound = 10;
                }
            }
        }

        const fightTotal = ptsWinner + ptsMethod + ptsRound + ptsBonus;
        totalEventPoints += fightTotal;

        const pickDisplay = `${pick.fighter.name} (${pick.method} ${pick.round})`;
        const resultDisplay = fight.winner_id
            ? `${fight.winner?.name} (${fight.method} ${fight.round_end})`
            : 'Pendente';

        grid.push({
            fight: fightLabel,
            pick: pickDisplay,
            result: resultDisplay,
            win: ptsWinner,
            met: ptsMethod,
            rnd: ptsRound,
            bon: ptsBonus,
            tot: fightTotal,
            sum: totalEventPoints
        });
    }

    console.log(`\n### Score Breakdown for ${user.name} - ${event.title}\n`);
    console.log(`| Luta | Palpite | Resultado Oficial | Venc | Met | Rnd | Bon | Total | Acum |`);
    console.log(`|---|---|---|---|---|---|---|---|---|`);
    grid.forEach(i => {
        console.log(`| ${i.fight} | ${i.pick} | ${i.result} | ${i.win} | ${i.met} | ${i.rnd} | ${i.bon} | **${i.tot}** | **${i.sum}** |`);
    });
    console.log(`\n**TOTAL EVENTO: ${totalEventPoints}**`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
