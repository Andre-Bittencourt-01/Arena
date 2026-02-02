import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const league = await prisma.league.findFirst();
    if (league) {
        console.log(`\nLEAGUE_ID_FOUND: ${league.id}\n`);
    } else {
        console.log("\nNO_LEAGUE_FOUND\n");
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
