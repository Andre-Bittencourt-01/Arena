import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
    console.log('Applying direct SQL fix...')
    try {
        await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isYoutubeMember" BOOLEAN DEFAULT false;`)
        await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastYoutubeSync" TIMESTAMP;`)
        console.log('SQL applied successfully.')
    } catch (e: any) {
        console.error('SQL Fix Error:', e.message)
    }
}
main().catch(console.error).finally(() => prisma.$disconnect())
