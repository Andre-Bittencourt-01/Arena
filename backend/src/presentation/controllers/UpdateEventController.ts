import { FastifyRequest, FastifyReply } from "fastify";
import { UpdateEventUseCase } from "../../application/use-cases/admin/UpdateEventUseCase.js";
import { PrismaEventRepository } from "../../infrastructure/database/repositories/PrismaEventRepository.js";

export class UpdateEventController {
    async handle(req: FastifyRequest, reply: FastifyReply) {
        try {
            const { id } = req.params as { id: string };
            // Extract fields to sanitize dates
            const {
                date,
                end_date,
                lock_time,
                cascade_start_time,
                ...rest
            } = req.body as any;

            // Helper to parse dates or return null
            const parseDate = (val: any) => {
                if (!val || val === "") return null;
                const d = new Date(val);
                return isNaN(d.getTime()) ? null : d;
            };

            // Sanitize Payload
            const sanitizedData = {
                ...rest,
                date: parseDate(date), // Date is usually required
                end_date: parseDate(end_date),
                lock_time: parseDate(lock_time),
                cascade_start_time: parseDate(cascade_start_time),
            };

            // Validation: Event Date is mandatory (if provided in update)
            if (date !== undefined && !sanitizedData.date) {
                // Note: If date was sent as "" (empty), it became null. If strict required, error here.
                // For update, usually we keep existing if undefined, but explicit null might mean "clear" (not allowed for main date).
            }

            const repository = new PrismaEventRepository();
            const useCase = new UpdateEventUseCase(repository);

            // CORRECTED: UseCase expects a single object { id, ...data }
            const event = await useCase.execute({
                id,
                ...sanitizedData
            });

            return reply.send(event);

        } catch (error: any) {
            console.error("❌ [UpdateEvent] Error:", error);
            return reply.status(500).send({ error: error.message });
        }
    }
}
