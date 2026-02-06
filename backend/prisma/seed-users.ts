import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding 10 Test Users...');

    const password = 'test123456';
    const hashedPassword = await bcrypt.hash(password, 10);
    const createdEmails: string[] = [];

    for (let i = 1; i <= 10; i++) {
        const num = i.toString().padStart(2, '0');
        const email = `test${num}@arenamma.app`;
        const name = `Test User ${num}`;

        const user = await prisma.user.upsert({
            where: { email },
            update: {
                password_hash: hashedPassword,
                name,
                points: 0,
                monthly_points: 0,
                yearly_points: 0
            },
            create: {
                email,
                name,
                password_hash: hashedPassword,
                // Role and IsYoutubeMember have defaults
            }
        });

        console.log(`Created/Updated: ${user.email}`);
        createdEmails.push(user.email);
    }

    console.log('\n--- Seed Complete ---');
    console.log('Users created with password: ' + password);
    console.table(createdEmails);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
