import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
    try {
        console.log('🚀 Starting seed...')

        // 1. CLEANUP (Opcional: use apenas se quiser reset total, mas o upsert resolve o Admin)
        // console.log('Cleaning up old data...')
        // await prisma.pick.deleteMany()
        // ...

        // 2. USUÁRIOS (Admin Fix)
        console.log('👥 Seeding Users...')

        // Hash da senha 123456
        const passwordHash = await hash('123456', 6)
        console.log("✅ Senha Hash Gerada:", passwordHash);

        const userAndre = await prisma.user.upsert({
            where: { email: "andre@arena.com" },
            update: {
                name: "André",
                password_hash: passwordHash,
                role: "OWNER",
            },
            create: {
                id: "user_andre",
                name: "André",
                email: "andre@arena.com",
                password_hash: passwordHash,
                role: "OWNER",
                points: 1350,
                monthly_points: 450,
                yearly_points: 1250,
                monthly_rank_delta: 2,
                avatar_url: "https://ui-avatars.com/api/?name=Andre",
            }
        })

        console.log('✅ Admin user processed:', userAndre.email)

        // 3. LUTADORES
        console.log('🥊 Seeding Fighters...')
        const fightersData = [
            { id: "omally", name: "Sean O'Malley", wins: 17, losses: 1 },
            { id: "topuria", name: "Ilia Topuria", wins: 14, losses: 0 },
            { id: "volk", name: "Alex Volkanovski", wins: 26, losses: 3 },
            { id: "lopes", name: "Diego Lopes", wins: 23, losses: 6 },
        ]

        for (const fighter of fightersData) {
            await prisma.fighter.upsert({
                where: { id: fighter.id },
                update: fighter,
                create: fighter
            })
        }

        // 4. EVENTOS & LUTAS
        console.log('📅 Seeding Events & Fights...')

        const eventUfc325 = await prisma.event.upsert({
            where: { id: "evt_ufc325" },
            update: {
                title: "UFC 325",
                subtitle: "O'Malley vs Topuria",
                date: new Date("2026-03-08T03:00:00Z"),
                location: "Las Vegas, NV",
                status: "SCHEDULED",
                lock_status: "OPEN",
            },
            create: {
                id: "evt_ufc325",
                title: "UFC 325",
                subtitle: "O'Malley vs Topuria",
                date: new Date("2026-03-08T03:00:00Z"),
                location: "Las Vegas, NV",
                status: "SCHEDULED",
                lock_status: "OPEN",
            }
        })

        // Lutas
        await prisma.fight.upsert({
            where: { id: "fight_omally_topuria" },
            update: {},
            create: {
                id: "fight_omally_topuria",
                event_id: eventUfc325.id,
                fighter_a_id: "omally",
                fighter_b_id: "topuria",
                rounds: 5,
                is_title: true,
                category: "Main Event",
                weight_class: "Featherweight"
            }
        })

        await prisma.fight.upsert({
            where: { id: "fight_volk_lopes" },
            update: {},
            create: {
                id: "fight_volk_lopes",
                event_id: eventUfc325.id,
                fighter_a_id: "volk",
                fighter_b_id: "lopes",
                rounds: 3,
                is_title: false,
                category: "Co-Main Event",
                weight_class: "Featherweight"
            }
        })

        // 5. LIGAS
        console.log('🏆 Seeding Leagues...')
        await prisma.league.upsert({
            where: { id: "league_170325" },
            update: {
                name: "Amigos do Tatame",
                invite_code: "X7K9L2",
                owner_id: userAndre.id,
            },
            create: {
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
        })

        console.log('✨ Seed completed successfully!')
    } catch (error) {
        console.error('❌ Error during seeding:', error)
        process.exit(1)
    }
}

main()
    .finally(async () => {
        await prisma.$disconnect()
    })
