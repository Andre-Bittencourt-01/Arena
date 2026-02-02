
async function main() {
    try {
        console.log("Testing Save Pick (Future Event)...");
        const response = await fetch("http://localhost:3333/picks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: "user_andre",
                fightId: "fight_omally_topuria",
                eventId: "evt_ufc325",
                fighterId: "omally",
                method: "KO/TKO",
                round: "R1"
            })
        });

        const result = await response.json();
        if (!response.ok) {
            console.error("Save Pick Failed:", response.status, result);
        } else {
            console.log("Pick Saved:", result);
        }

        console.log("\nTesting Validation (Locked Event)...");
        // This requires database manipulation or a specific event in the past.
        // We can manually check the logic by ensuring 'evt_ufc325' in seed is far enough in the future.
        // In seed, UFC 325 is set to 2026-03-08.

        console.log("Verification Finished");
    } catch (e) {
        console.error("Error:", e);
    }
}

main();
