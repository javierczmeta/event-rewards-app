const { haversine } = require("./haversine");
const { calculateCommute } = require("./mapboxFunctions");

/**
 * Given events with start time and end time, as well as a 'profit'. Maximize profit without overlapping events
 * @param {object[]} events array of events. must have start_time, end_time and profit
 * @returns list of event ids to go to and the profit
 */
function schedule(events) {
    const eventList = events.toSorted((a, b) => {
        return new Date(a.start_time) - new Date(b.start_time);
    });

    // Initialize dp arrays
    const maxProfit = [];
    const goOrSkip = [];
    for (let _ of eventList) {
        maxProfit.push(null);
        goOrSkip.push(null);
    }

    // Go in decreasing order
    for (let i = eventList.length - 1; i >= 0; i--) {
        // For each event we can choose to go to it or skip it
        // Find profit in both cases and choose max

        // Going. We need to find the next available event to jump to
        let profitGoing = 0;
        let nextEvent;
        for (let j = i + 1; j < eventList.length; j++) {
            if (eventList[j].start_time >= eventList[i].end_time) {
                nextEvent = j;
                break;
            }
        }

        if (nextEvent) {
            profitGoing = eventList[i].profit + maxProfit[nextEvent];
        } else {
            profitGoing = eventList[i].profit;
        }

        // Not going. We add the next event's max profit, if available
        let profitSkip = 0;
        if (i < eventList.length - 1) {
            profitSkip = maxProfit[i + 1];
        }

        // Compare both profits, choose higher
        if (profitGoing > profitSkip) {
            maxProfit[i] = profitGoing;
            goOrSkip[i] = nextEvent;
        } else {
            maxProfit[i] = profitSkip;
            goOrSkip[i] = "SKIP";
        }
    }

    const result = [];
    let i = 0;
    while (i !== null && i < eventList.length) {
        if (goOrSkip[i] !== "SKIP") {
            result.push(eventList[i].id);
            i = goOrSkip[i];
        } else {
            i++;
        }
    }

    return { selectedEventIds: result, totalProfit: maxProfit[0] };
}

/**
 * Returns commute penalty for a commute tie in minutes
 * @param {number} commuteTime in minutes
 * @returns float between 0 and 1
 */
function commutePenalty(commuteTime, timeBetween) {
    timeBetween = timeBetween - 10 // 10 minute buffer 
    return Math.min(1, 2.1718 ** (-0.02 * (commuteTime - timeBetween)));
}

/**
 * Given events with start time and end time, as well as a 'profit'. Maximize profit without overlapping events.
 * Take into account commute time between events. (driving)
 * @param {object[]} events array of events. must have start_time, end_time and profit. Must have location (lng, lat)
 * @returns list of event ids to go to and the profit
 */
async function scheduleWithCommutes(events) {
    const eventList = events.toSorted((a, b) => {
        return new Date(a.start_time) - new Date(b.start_time);
    });

    // Initialize dp arrays
    const maxProfitMemo = [];
    const goOrSkip = [];
    const commutes = []
    for (let _ of eventList) {
        maxProfitMemo.push(null);
        goOrSkip.push(null);
        commutes.push(null)
    }

    const commuteMemo = new Map()

    const maxProfit = async (i) => {
        if (i >= eventList.length) {
            return 0;
        }

        if (maxProfitMemo[i]) {
            return maxProfitMemo[i];
        }

        // Going, cannot only check first event that fits, will check every event and add commute penalty
        let nextIndex = null;
        let profitGoing = eventList[i].profit;
        let goingCommuteObj = null;;
        let goingTimeBetween = 0;
        for (let j = i + 1; j < eventList.length; j++) {

            // Create a string key to memoize commute results
            const key = JSON.stringify([eventList[i].id, eventList[j].id].sort((a,b) => {return a - b}))
            const commuteObj = commuteMemo.has(key) ? commuteMemo.get(key) : await calculateCommute(
                eventList[i],
                eventList[j]
            );
            commuteMemo.set(key, commuteObj)

            // Compare to find max
            if (eventList[j].start_time > eventList[i].end_time) {
                const timeBetween = ((new Date(eventList[j].start_time)) - (new Date(eventList[i].end_time))) / (1000 * 60) // Time between in minutes
                profitGoing = (eventList[i]["profit"] + await maxProfit(j)) * commutePenalty(commuteObj.time)
                nextIndex = j
                goingCommuteObj = commuteObj
                goingTimeBetween = timeBetween
            }
        }

        // Skipping event, profit is the next event
        let profitSkip = 0;
        profitSkip = await maxProfit(i + 1);

        // Compare profits, find max and record information
        if (profitGoing >= profitSkip) {
            maxProfitMemo[i] = profitGoing;
            goOrSkip[i] = nextIndex;
            commutes[i] = [goingCommuteObj, goingTimeBetween];
        } else {
            maxProfitMemo[i] = profitSkip;
            goOrSkip[i] = "SKIP";
        }
        
        return maxProfitMemo[i];
    };
    await maxProfit(0);

    const result = [];
    const finalCommutes = []
    let i = 0;
    while (i !== null && i < eventList.length) {
        if (goOrSkip[i] !== "SKIP") {
            result.push(eventList[i].id);
            finalCommutes.push(commutes[i])
            i = goOrSkip[i];
        } else {
            i++;
        }
    }

    return { selectedEventIds: result, totalProfit: maxProfitMemo[0], finalCommutes };
}

/**
 * Updates the events to include profit field by rewards
 * @param {Array} events array of events
 * @param {number} weight number between 0 and 1
 */
function getProfitByPoints(events, weight) {
    for (let i = 0; i < events.length; i++) {
        if (events[i].profit === undefined) {
            events[i].profit = events[i].rewards * weight
        } else {
            events[i].profit += events[i].rewards * weight
        }
    }
    return events
}

/**
 * Updates the events to include profit field by distance
 * @param {Array} events array of events
 * @param {object} userLocation {lng, lat}
 * @param {number} weight number between 0 and 1
 */
function getProfitByDistance(events, userLocation, weight) {
    // Get max score -> median of event rewards
    const MAX_SCORE = getMedianRewards(events)
    const distances = []
    let min_distance = Infinity
    let max_distance = -Infinity
    for (let i = 0; i < events.length; i++) {
        // reverse profit, closer = higher profit
        const distanceKM = haversine({lon: events[i].longitude, lat: events[i].latitude}, {lon: userLocation.lng, lat: userLocation.lat}).km
        distances.push(distanceKM)
        if (distanceKM < min_distance) {
            min_distance = distanceKM
        }
        if (distanceKM > max_distance) {
            max_distance = distanceKM
        }
    }
    
    for (let i = 0; i < events.length; i++) {
        // Score is linear decrease between min distance and max distance
        let score = (MAX_SCORE/(min_distance - max_distance)) * distances[i] - ((MAX_SCORE * max_distance) / (min_distance - max_distance))
        if (Number.isNaN(score)) {
            score = 0
        }
        if (events[i].profit) {
            events[i].profit += score * weight
        } else {
            events[i].profit = score * weight
        }
    }
    return events
}
        if (events[i].profit) {
            events[i].profit += 100 - distanceKM
        } else {
            events[i].profit = 100 - distanceKM
        }
    }
    return events
}

/**
 * Returns the median rewards value from an event list
 * @param {object} events must have rewards property 
 * @returns {number} median
 */
function getMedianRewards(events) {
    if (events.length === 0) {
        return 0
    }

    const rewards = []
    for (let i = 0; i < events.length; i++) {
        rewards.push(events[i].rewards)
    }
    
    rewards.sort((a, b) => a - b);

    const middleIndex = Math.floor(rewards.length / 2)

    if (rewards.length % 2 === 0) {
        return (rewards[middleIndex - 1] + rewards[middleIndex]) / 2
    } else {
        return rewards[middleIndex]
    }
}
