-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('SCHEDULED', 'LIVE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "LockStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "FightResult" AS ENUM ('WIN', 'DRAW', 'NC');

-- CreateEnum
CREATE TYPE "LeagueRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "google_id" TEXT,
    "apple_subject_id" TEXT,
    "youtube_channel_id" TEXT,
    "points" INTEGER NOT NULL DEFAULT 0,
    "monthly_points" INTEGER NOT NULL DEFAULT 0,
    "yearly_points" INTEGER NOT NULL DEFAULT 0,
    "monthly_rank_delta" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSettings" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "ManagedChannel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "youtube_id" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_sync_status" TEXT,

    CONSTRAINT "ManagedChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserMembership" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "managed_channel_id" TEXT NOT NULL,
    "tier_name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "banner_url" TEXT,
    "status" "EventStatus" NOT NULL DEFAULT 'SCHEDULED',
    "lock_status" "LockStatus" NOT NULL DEFAULT 'OPEN',

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fighter" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nickname" TEXT,
    "image_url" TEXT,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "draws" INTEGER NOT NULL DEFAULT 0,
    "nc" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Fighter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fight" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "fighter_a_id" TEXT NOT NULL,
    "fighter_b_id" TEXT NOT NULL,
    "winner_id" TEXT,
    "category" TEXT,
    "weight_class" TEXT,
    "rounds" INTEGER NOT NULL,
    "is_title" BOOLEAN NOT NULL DEFAULT false,
    "result" "FightResult",
    "method" TEXT,
    "round_end" TEXT,
    "time" TEXT,

    CONSTRAINT "Fight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pick" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "fight_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "fighter_id" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "round" TEXT NOT NULL,
    "points_earned" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Pick_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "League" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "invite_code" TEXT NOT NULL,
    "logo_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "owner_id" TEXT NOT NULL,

    CONSTRAINT "League_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeagueMember" (
    "id" TEXT NOT NULL,
    "league_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "LeagueRole" NOT NULL DEFAULT 'MEMBER',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeagueMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_google_id_key" ON "User"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_apple_subject_id_key" ON "User"("apple_subject_id");

-- CreateIndex
CREATE UNIQUE INDEX "ManagedChannel_youtube_id_key" ON "ManagedChannel"("youtube_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserMembership_user_id_managed_channel_id_key" ON "UserMembership"("user_id", "managed_channel_id");

-- CreateIndex
CREATE UNIQUE INDEX "Pick_user_id_fight_id_key" ON "Pick"("user_id", "fight_id");

-- CreateIndex
CREATE UNIQUE INDEX "League_invite_code_key" ON "League"("invite_code");

-- CreateIndex
CREATE UNIQUE INDEX "LeagueMember_league_id_user_id_key" ON "LeagueMember"("league_id", "user_id");

-- AddForeignKey
ALTER TABLE "UserMembership" ADD CONSTRAINT "UserMembership_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMembership" ADD CONSTRAINT "UserMembership_managed_channel_id_fkey" FOREIGN KEY ("managed_channel_id") REFERENCES "ManagedChannel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fight" ADD CONSTRAINT "Fight_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fight" ADD CONSTRAINT "Fight_fighter_a_id_fkey" FOREIGN KEY ("fighter_a_id") REFERENCES "Fighter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fight" ADD CONSTRAINT "Fight_fighter_b_id_fkey" FOREIGN KEY ("fighter_b_id") REFERENCES "Fighter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fight" ADD CONSTRAINT "Fight_winner_id_fkey" FOREIGN KEY ("winner_id") REFERENCES "Fighter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pick" ADD CONSTRAINT "Pick_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pick" ADD CONSTRAINT "Pick_fight_id_fkey" FOREIGN KEY ("fight_id") REFERENCES "Fight"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pick" ADD CONSTRAINT "Pick_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pick" ADD CONSTRAINT "Pick_fighter_id_fkey" FOREIGN KEY ("fighter_id") REFERENCES "Fighter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "League" ADD CONSTRAINT "League_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeagueMember" ADD CONSTRAINT "LeagueMember_league_id_fkey" FOREIGN KEY ("league_id") REFERENCES "League"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeagueMember" ADD CONSTRAINT "LeagueMember_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
