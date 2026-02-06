import { FastifyRequest, FastifyReply } from 'fastify';
import { GetGlobalLeaderboardUseCase } from '../../../domain/useCases/leaderboard/GetGlobalLeaderboardUseCase.js';

const getGlobalLeaderboardUseCase = new GetGlobalLeaderboardUseCase();

export class GetGlobalLeaderboardController {
    async handle(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { period, eventId } = request.query as { period?: string, eventId?: string };

            // Validate Period
            const validPeriods = ['week', 'month', 'year', 'all'];
            const selectedPeriod = (validPeriods.includes(period || '') ? period : 'all') as 'week' | 'month' | 'year' | 'all';

            // Validate EventId for Week
            if (selectedPeriod === 'week' && !eventId) {
                return reply.status(400).send({ error: "eventId is required for 'week' period ranking" });
            }

            const leaderboard = await getGlobalLeaderboardUseCase.execute({
                period: selectedPeriod,
                eventId: eventId
            });

            return reply.send(leaderboard);
        } catch (error) {
            console.error(error);
            return reply.status(500).send({ error: "Internal Server Error" });
        }
    }
}
