import { ListLeaguesController } from "../../../interface/controllers/league/ListLeaguesController.js";
const listLeaguesController = new ListLeaguesController();
export async function leagueRoutes(server) {
    server.get('/leagues', listLeaguesController.handle);
}
//# sourceMappingURL=leagueRoutes.js.map