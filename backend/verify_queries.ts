const API_URL = 'http://localhost:3333';

async function verifyQueries() {
    console.log("Testing Upcoming Events...");
    try {
        const res = await fetch(`${API_URL}/events/upcoming`);
        const data: any = await res.json();
        console.log("Events found:", data.length);
        if (data.length > 0) {
            console.log("First event:", data[0].id, data[0].title);
        }
    } catch (e: any) {
        console.error("Events Error:", e.message);
    }

    console.log("\nTesting League Leaderboard...");
    try {
        const leagueId = 'league_170325';
        const res = await fetch(`${API_URL}/leagues/${leagueId}/leaderboard`);
        const data: any = await res.json();
        console.log("Leaderboard entries:", data.length);
        if (data.length > 0) {
            console.log("Top user:", data[0].username, "Points:", data[0].totalPoints);
        }
    } catch (e: any) {
        console.error("Leaderboard Error:", e.message);
    }

    console.log("\nTesting User Picks Query...");
    try {
        const userId = 'user_andre';
        const eventId = 'evt_ufc325';
        const res = await fetch(`${API_URL}/events/${eventId}/my-picks?userId=${userId}`);
        const data: any = await res.json();
        console.log("User picks found:", data.length);
    } catch (e: any) {
        console.error("Picks Error:", e.message);
    }

    console.log("\nVerification Finished");
}

verifyQueries();
