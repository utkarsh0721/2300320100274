
function scheduleMaintenance(budget, tasks) {
    const n = tasks.length;
    
    const dp = new Array(budget + 1).fill(0);
    
    const keep = Array.from({ length: n }, () => new Array(budget + 1).fill(false));

    for (let i = 0; i < n; i++) {
        const duration = tasks[i].Duration;
        const impact = tasks[i].Impact;
        
        for (let w = budget; w >= duration; w--) {
            if (dp[w - duration] + impact > dp[w]) {
                dp[w] = dp[w - duration] + impact;
                keep[i][w] = true; 
            }
        }
    }

    let currentBudget = budget;
    const selectedTaskIDs = [];
    
    for (let i = n - 1; i >= 0; i--) {
        if (keep[i][currentBudget]) {
            selectedTaskIDs.push(tasks[i].TaskID);
            currentBudget -= tasks[i].Duration;
        }
    }

    return {
        maxImpact: dp[budget],
        selectedTaskIDs: selectedTaskIDs.reverse()
    };
}

async function runScheduler() {
    try {
        const myToken ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJ1dGthcnNoc2hhcm1hMDcyMUBnbWFpbC5jb20iLCJleHAiOjE3ODA5ODc5NTksImlhdCI6MTc4MDk4NzA1OSwiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6IjdjMWZmM2EzLTY1ZjktNDVhNy1iNDlmLTA2YTBlMTA4MTI0MCIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6InV0a2Fyc2giLCJzdWIiOiI4NjRmZjZiMS0xMjc5LTRmNGYtOTQ0Yi0xMTllZjk3OGUzN2EifSwiZW1haWwiOiJ1dGthcnNoc2hhcm1hMDcyMUBnbWFpbC5jb20iLCJuYW1lIjoidXRrYXJzaCIsInJvbGxObyI6IjIzMDAzMjAxMDAyNzQiLCJhY2Nlc3NDb2RlIjoiY1h1cWh0IiwiY2xpZW50SUQiOiI4NjRmZjZiMS0xMjc5LTRmNGYtOTQ0Yi0xMTllZjk3OGUzN2EiLCJjbGllbnRTZWNyZXQiOiJSSERKTkt6VEpEd01nak5HIn0.gc8mxm4dSBniHhLMawNgvilZvI0WRSRTO1RhYyVZorY";
        const requestOptions = {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${myToken}`,
                'Content-Type': 'application/json'
            }
        };

        console.log("Fetching depots and vehicles data...");

        const [depotResponse, vehicleResponse] = await Promise.all([
            fetch('http://4.224.186.213/evaluation-service/depots', requestOptions),
            fetch('http://4.224.186.213/evaluation-service/vehicles', requestOptions)
        ]);

        if (!depotResponse.ok) throw new Error(`Depot API failed: ${depotResponse.status}`);
        if (!vehicleResponse.ok) throw new Error(`Vehicle API failed: ${vehicleResponse.status}`);

        const depotData = await depotResponse.json();
        const vehicleData = await vehicleResponse.json();

        const depots = depotData.depots || depotData; 
        const vehicles = vehicleData.vehicles || vehicleData; 

        for (const depot of depots) {
            console.log(`Available Budget: ${depot.MechanicHours} hours`);
            
            const result = scheduleMaintenance(depot.MechanicHours, vehicles);
            
            console.log(`Maximum Impact Achieved: ${result.maxImpact}`);
            console.log(`Tasks Scheduled:`, result.selectedTaskIDs);
        }

    } catch (error) {
        console.error("Error fetching or processing data:", error);
    }
}

runScheduler();

