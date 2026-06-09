require('dotenv').config();


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
        const myToken = process.env.API_AUTH_TOKEN;
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

