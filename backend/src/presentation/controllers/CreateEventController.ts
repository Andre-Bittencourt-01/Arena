import { FastifyReply, FastifyRequest } from "fastify";
import { CreateEventUseCase } from "../../application/use-cases/admin/CreateEventUseCase.js";
import { PrismaEventRepository } from "../../infrastructure/database/repositories/PrismaEventRepository.js";

export class CreateEventController {
    async handle(request: FastifyRequest, reply: FastifyReply) {
        console.log("\n📦 [DEBUG ADMIN] Payload recebido para criação de evento:", request.body);

        try {
            const { title, date, ...rest } = request.body as any;

            if (!title) {
                console.log("❌ [DEBUG ADMIN] Falha: Título não fornecido.");
                return reply.status(400).send({ error: "Título é obrigatório" });
            }

            if (!date) {
                console.log("❌ [DEBUG ADMIN] Falha: Data não fornecida.");
                return reply.status(400).send({ error: "Data é obrigatória" });
            }

            // Conversão de Data (Crítico)
            console.log(`🕒 [DEBUG ADMIN] Tentando converter data: ${date}`);
            const eventDate = new Date(date);

            if (isNaN(eventDate.getTime())) {
                console.log("❌ [DEBUG ADMIN] Falha: Data inválida.");
                return reply.status(400).send({ error: "Formato de data inválido" });
            }

            console.log("✅ [DEBUG ADMIN] Data convertida com sucesso:", eventDate.toISOString());

            const repository = new PrismaEventRepository();
            const useCase = new CreateEventUseCase(repository);

            const event = await useCase.execute({
                title,
                date: eventDate,
                ...rest
            });

            console.log("🚀 [DEBUG ADMIN] Evento criado com sucesso:", event.id);
            // Ensuring response body is returned for frontend usage
            return reply.status(201).send(event);
        } catch (error: any) {
            console.error("🚨 [DEBUG ADMIN] Erro fatal na criação de evento:", error.message);
            return reply.status(500).send({ error: error.message });
        }
    }
}
