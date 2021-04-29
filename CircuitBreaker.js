const fetch = require('node-fetch')
const EventTracking = require('./EventTracking')
const config = require('./config')

const event = EventTracking();

const CircuitBreaker = () => {
    let lastFailedCall = 0; // timestamp
    let failedCalls = 0;

    return {
        healthcheck: async () => {
            const now = Date.now();

       
            if (lastFailedCall && now - lastFailedCall <= 10000) {
                console.log("Skipping call");
                console.log("-------------------------");
                return;
            }

            try {
                const port = config.port;
                const response = await fetch(`http://localhost:${port}/healthcheck`);
                const json = await response.json();

                event.healthcheckStatus(json.status)
                failedCalls = 0;
            } catch (e) {


                lastFailedCall = Date.now();
                failedCalls++;
                event.healthcheckFailed(e.message);

                if (failedCalls >= 3) {
                    event.healthcheckFailed("FIX THIS NOW!")
                }

            }

        }
    }
}


module.exports = CircuitBreaker