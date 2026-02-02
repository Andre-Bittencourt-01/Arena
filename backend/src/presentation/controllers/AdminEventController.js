import { ProcessEventResultsUseCase } from '../../domain/useCases/event/ProcessEventResultsUseCase.js';
import { PrismaFightRepository } from '../../infra/database/repositories/PrismaFightRepository.js';
import { PrismaPickRepository } from '../../infra/database/repositories/PrismaPickRepository.js';
import { PrismaUserRepository } from '../../infra/database/repositories/PrismaUserRepository.js';
import { ScoringService } from '../../domain/services/ScoringService.js';
const fightRepository = new PrismaFightRepository();
const pickRepository = new PrismaPickRepository();
const userRepository = new PrismaUserRepository();
const scoringService = new ScoringService();
const processEventResultsUseCase = new ProcessEventResultsUseCase(fightRepository, pickRepository, userRepository, scoringService);
export class AdminEventController {
    async processResults(request, reply) {
        // Simple Auth Check (Fake Middleware logic inside controller for now)
        const adminSecret = request.headers['x-admin-secret'];
        if (adminSecret !== 'arena-mma-secret-2025') {
            return reply.status(401).send({ error: "Unauthorized" });
        }
        try {
            const { eventId } = request.params;
            const { results } = request.body;
            await processEventResultsUseCase.execute({
                eventId,
                results
            });
            return reply.status(200).send({ message: "Event results processed successfully" });
        }
        catch (error) {
            console.error(error);
            return reply.status(500).send({ error: error.message || "Internal Server Error" });
        }
    }
}
//# sourceMappingURL=AdminEventController.js.map