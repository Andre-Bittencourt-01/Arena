import { IFightRepository, UpdateFightDTO } from "../../../domain/repositories/IFightRepository.js";
// Inject new dependencies
import { IPickRepository } from "../../../domain/repositories/IPickRepository.js";
import { ScoringService } from "../../../domain/services/ScoringService.js";

// Ensure Interface includes all fields needed
interface UpdateFightRequest {
    id: string;
    event_id: string;
    fighter_a_id: string;
    fighter_b_id: string;
    rounds: number;
    is_title: boolean;
    category: string;
    weight_class?: string;
    video_url?: string;
    status?: string;
    order?: number;
    winner_id?: string | null;
    result?: string | null;
    method?: string | null;
    round_end?: number | null;
    time?: string | null;
    points?: number;
    lock_status?: string;
    custom_lock_time?: string | Date | null;
}

import { IUserRepository } from "../../../domain/repositories/IUserRepository.js";

export class UpdateFightUseCase {
    private scoringService: ScoringService;

    // Updated Constructor
    constructor(
        private fightRepository: IFightRepository,
        private pickRepository: IPickRepository,
        private userRepository: IUserRepository
    ) {
        this.scoringService = new ScoringService();
    }

    async execute(data: UpdateFightRequest): Promise<void> {
        // 1. Fetch current fight WITH Event data to check cascade settings
        const currentFight = await this.fightRepository.findByIdWithEvent(data.id);
        if (!currentFight) throw new Error("Fight not found");

        let finalCustomLockTime = data.custom_lock_time;
        let finalLockStatus = data.lock_status;

        // 2. SMART LOGIC: Did the user just UNLOCK this fight?
        // If passing 'OPEN' (or 'cascade' equivalent) AND the event has a cascade_start_time...
        const isUnlocking = (data.lock_status === 'OPEN' || data.lock_status === 'cascade');
        const eventHasCascade = currentFight.event && currentFight.event.cascade_start_time;

        if (isUnlocking && eventHasCascade && !data.custom_lock_time) {
            console.log(`[CASCADE] Auto-restoring cascade time for Fight ${data.id}`);

            const startTime = new Date(currentFight.event.cascade_start_time!);

            // Use new order if provided, else current
            const orderToUse = (data.order !== undefined) ? data.order : currentFight.order;

            // Math
            const orderIndex = (orderToUse && orderToUse > 0) ? orderToUse - 1 : 0;
            const minutesToAdd = orderIndex * 30;

            // Overwrite the empty time with the calculated cascade time
            finalCustomLockTime = new Date(startTime.getTime() + minutesToAdd * 60000);

            // Force status to OPEN so the scheduler picks it up
            finalLockStatus = 'OPEN';
        }

        // 3. Prepare Update Data
        const updateData: UpdateFightDTO = {
            event_id: data.event_id,
            fighter_a_id: data.fighter_a_id,
            fighter_b_id: data.fighter_b_id,
            category: data.category,
            weight_class: data.weight_class,
            rounds: data.rounds,
            status: data.status,
            order: data.order,
            video_url: data.video_url,
            is_title: data.is_title,
            winner_id: data.winner_id || null,
            result: (data.result as any) || null,
            method: data.method || null,
            round_end: data.round_end ? String(data.round_end) : null,
            time: data.time || null,
            points: data.points,
            lock_status: finalLockStatus,
            custom_lock_time: finalCustomLockTime as any
        };

        // 4. SCORING ENGINE TRIGGER
        // If we have a winner and status is COMPLETED (or we are concluding via winner_id)
        if (data.winner_id) {
            console.log(`[SCORING ENGINE] Calculating scores for Fight ${data.id}...`);

            // Check for previous scoring to avoid double count?
            // For now, allow recalculation (idempotent logic helps, but incrementing user points is risky if run twice).
            // Ideal: In a real system, we'd wipe previous points for this fight or use a 'processed' flag.
            // Assumption for MVP: Admin is careful or system is robust.
            // Better Approach: Calculate DELTA or Wipe & Rewrite.
            // Current approach (Reset & Add):
            // Since we don't have easy rollback of User points without complex logic, we assume this is the definitive run.

            const picks = await this.pickRepository.findByEvent(currentFight.event_id);
            // Filter picks specifically for THIS fight
            const fightPicks = picks.filter(p => p.fight_id === data.id);

            // Calculate Stats for Mitada
            const totalFightPicks = fightPicks.length;
            const winnerPickCount = fightPicks.filter(p => p.fighter_id === data.winner_id).length;

            const picksToUpdate: { id: string, points: number, userId: string }[] = [];

            // Mock complete Fight object for ScoringService (merge current + updates)
            const mockFight: any = {
                ...currentFight,
                winner_id: data.winner_id,
                method: data.method,
                round_end: data.round_end ? String(data.round_end) : null,
                is_title: data.is_title,
                category: data.category
            };

            for (const pick of fightPicks) {
                const points = this.scoringService.calculatePoints(
                    pick,
                    mockFight,
                    totalFightPicks,
                    winnerPickCount
                );

                if (points > 0 || pick.points_earned > 0) {
                    // We update even if 0 to reset if it was previously scored wrong
                    picksToUpdate.push({
                        id: pick.id,
                        points: points,
                        userId: pick.user_id
                    });
                }
            }

            // 5. Execute Transactional Update (Atomic: Update Fight + Scoring)
            if (fightPicks.length >= 0) { // Allow even if 0 picks to ensure fight update happens atomically
                // Closure for scoring logic (passed to repository)
                const calculatePointsFn = (pick: any) => {
                    return this.scoringService.calculatePoints(
                        pick,
                        mockFight,
                        totalFightPicks,
                        winnerPickCount
                    );
                };

                await this.fightRepository.resolveFightAndScores(data.id, updateData, calculatePointsFn);

                // 6. GABARITO CHECK (Event Level Bonus)
                const allFights = await this.fightRepository.findByEventId(currentFight.event_id);

                // Check if all fights are finished (excluding current one which we just updated but might be stale in allFights fetch)
                const areAllFightsFinished = allFights.every(f =>
                    (f.id === data.id) ? true : (f.status === 'COMPLETED' || f.result !== null)
                );

                if (areAllFightsFinished) {
                    console.log(`[EVENT BONUS] Event ${currentFight.event_id} is complete. Checking for Gabaritos...`);

                    // Fetch all picks for event (fresh state)
                    const allEventPicks = await this.pickRepository.findByEvent(currentFight.event_id);

                    // Group by User
                    const userPicksMap = new Map<string, typeof allEventPicks>();
                    allEventPicks.forEach(p => {
                        if (!userPicksMap.has(p.user_id)) userPicksMap.set(p.user_id, []);
                        userPicksMap.get(p.user_id)!.push(p);
                    });

                    // Identify Eligible Fights
                    const validFights = allFights.filter(f => f.winner_id || (f.id === data.id && data.winner_id));

                    const perfectUsers: string[] = [];

                    for (const [userId, userPicks] of userPicksMap) {
                        let missedAny = false;
                        let pickedCount = 0;

                        for (const fight of validFights) {
                            const winnerId = (fight.id === data.id) ? data.winner_id : fight.winner_id;
                            if (!winnerId) continue;

                            const pick = userPicks.find(p => p.fight_id === fight.id);
                            if (!pick || pick.fighter_id !== winnerId) {
                                missedAny = true;
                                break;
                            }
                            pickedCount++;
                        }

                        // Check completion
                        if (!missedAny && pickedCount === validFights.length && validFights.length > 0) {
                            perfectUsers.push(userId);
                        }
                    }

                    if (perfectUsers.length > 0) {
                        console.log(`[EVENT BONUS] ${perfectUsers.length} users achieved a Perfect Event (Gabarito)! awarding +90pts.`);
                        for (const userId of perfectUsers) {
                            await this.userRepository.incrementPoints(userId, 90);
                        }
                    }
                }

                return;
            }
        }

        // Fallback: Just update fight (no scoring or no picks)
        await this.fightRepository.update(data.id, updateData);
    }
}
