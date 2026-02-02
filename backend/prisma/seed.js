import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
    console.log('Starting seed...');
    // 1. CLEANUP (Ordem para evitar FK constraints)
    console.log('Cleaning up old data...');
    await prisma.pick.deleteMany();
    await prisma.leagueMember.deleteMany();
    await prisma.league.deleteMany();
    await prisma.fight.deleteMany();
    await prisma.event.deleteMany();
    await prisma.fighter.deleteMany();
    await prisma.userMembership.deleteMany();
    await prisma.managedChannel.deleteMany();
    await prisma.user.deleteMany();
    // 2. USUÁRIOS
    console.log('Seeding Users...');
    const userAndre = await prisma.user.create({
        data: {
            id: "user_andre",
            name: "André",
            email: "andre@arena.com",
            password_hash: "123456789",
            points: 1350,
            monthly_points: 450,
            yearly_points: 1250,
            monthly_rank_delta: 2,
            avatar_url: "https://ui-avatars.com/api/?name=Andre",
        }
    });
    // 3. LUTADORES
    console.log('Seeding Fighters...');
    await prisma.fighter.createMany({
        data: [
            { id: "omally", name: "Sean O'Malley", wins: 17, losses: 1 },
            { id: "topuria", name: "Ilia Topuria", wins: 14, losses: 0 },
            { id: "volk", name: "Alex Volkanovski", wins: 26, losses: 3 },
            { id: "lopes", name: "Diego Lopes", wins: 23, losses: 6 },
        ]
    });
    // 4. EVENTOS & LUTAS
    console.log('Seeding Events & Fights...');
    // Evento
    const eventUfc325 = await prisma.event.create({
        data: {
            id: "evt_ufc325",
            title: "UFC 325",
            subtitle: "O'Malley vs Topuria",
            date: new Date("2026-03-08T03:00:00Z"), // Data futura exemplo
            location: "Las Vegas, NV",
            status: "SCHEDULED",
            lock_status: "OPEN",
        }
    });
    // Lutas
    // O'Malley vs Topuria
    const fightMain = await prisma.fight.create({
        data: {
            id: "fight_omally_topuria",
            event_id: eventUfc325.id,
            fighter_a_id: "omally",
            fighter_b_id: "topuria",
            rounds: 5,
            is_title: true,
            category: "Main Event",
            weight_class: "Featherweight"
        }
    });
    // Volk vs Lopes
    await prisma.fight.create({
        data: {
            id: "fight_volk_lopes",
            event_id: eventUfc325.id,
            fighter_a_id: "volk",
            fighter_b_id: "lopes",
            rounds: 3,
            is_title: false,
            category: "Co-Main Event",
            weight_class: "Featherweight"
        }
    });
    // 5. LIGAS
    console.log('Seeding Leagues...');
    const league = await prisma.league.create({
        data: {
            id: "league_170325",
            name: "Amigos do Tatame",
            invite_code: "X7K9L2",
            owner_id: userAndre.id,
            members: {
                create: {
                    user_id: userAndre.id,
                    role: "OWNER"
                }
            }
        }
    });
    // 6. PALPITES
    console.log('Seeding Picks...');
    await prisma.pick.create({
        data: {
            user_id: userAndre.id,
            fight_id: fightMain.id,
            event_id: eventUfc325.id, // Redundância exigida pelo schema
            fighter_id: "omally",
            method: "KO/TKO",
            round: "R2"
        }
    });
    console.log('Seed completed successfully!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map