
async function main() {
    try {
        console.log("Testing Admin Process Results...");

        // 1. Process results for UFC 325
        const response = await fetch("http://localhost:3333/admin/events/evt_ufc325/results", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-admin-secret": "arena-mma-secret-2025"
            },
            body: JSON.stringify({
                results: [
                    {
                        fightId: "fight_omally_topuria",
                        winnerId: "omally", // Correct winner for our previous verification pick
                        method: "KO/TKO",
                        round: "R1"
                    }
                ]
            })
        });

        const result = await response.json();
        if (!response.ok) {
            console.error("Process Results Failed:", response.status, result);
        } else {
            console.log("Results Processed:", result);

            // 2. (Optional) Check User Points?
            // Since we don't have a GET /users endpoint yet, 
            // the fact it returned 200 means the logic executed without throwing.
        }

        console.log("Verification Finished");
    } catch (e) {
        console.error("Error:", e);
    }
}

main();
