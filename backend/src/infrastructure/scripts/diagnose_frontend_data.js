import axios from 'axios';
const api = axios.create({
    baseURL: 'http://localhost:3333',
});
async function diagnose() {
    console.log('--- DIAGNÓSTICO DE DADOS DO FRONTEND ---');
    try {
        // 1. Logar (Mock)
        console.log('\n1. Logando via /auth/mock/user_andre...');
        const authRes = await api.get('/auth/mock/user_andre');
        const token = authRes.data.token;
        console.log('Token recebido:', token ? 'SIM' : 'NÃO');
        if (!token)
            throw new Error('Falha ao obter token');
        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };
        // 2. Dados do Usuário (/me)
        console.log('\n2. Buscando dados do usuário (GET /me)...');
        try {
            const meRes = await api.get('/me', config);
            console.log('JSON /me:', JSON.stringify(meRes.data, null, 2));
        }
        catch (e) {
            console.log('Erro em /me:', e.response?.status || e.message);
        }
        // 3. Ligas (GET /leagues)
        console.log('\n3. Buscando ligas (GET /leagues)...');
        try {
            const leaguesRes = await api.get('/leagues', config);
            console.log('JSON /leagues:', JSON.stringify(leaguesRes.data, null, 2));
        }
        catch (e) {
            console.log('Erro em /leagues:', e.response?.status || e.message);
            console.log('Dica: Verifique se a rota global /leagues existe ou se o frontend deveria usar /users/:id/leagues.');
        }
        // 4. Ranking (GET /leagues/league_170325/leaderboard)
        console.log('\n4. Buscando ranking (GET /leagues/league_170325/leaderboard)...');
        try {
            const leaderboardRes = await api.get('/leagues/league_170325/leaderboard', config);
            console.log('JSON Leaderboard:', JSON.stringify(leaderboardRes.data, null, 2));
        }
        catch (e) {
            console.log('Erro em /leagues/league_170325/leaderboard:', e.response?.status || e.message);
        }
    }
    catch (error) {
        console.error('Falha no diagnóstico:', error.message);
    }
}
diagnose();
//# sourceMappingURL=diagnose_frontend_data.js.map