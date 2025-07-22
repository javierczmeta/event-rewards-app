/**
 * Calculates driving commute time between two locations using mapbox api
 * @param {object} eventA
 * @param {object} eventB
 * @returns {object} commute time, route
 */
async function calculateCommute(eventA, eventB) {
    // Placeholder function
    const api_key = process.env.MAPBOX_TOKEN;
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${eventA.longitude},${eventA.latitude};${eventB.longitude},${eventB.latitude}?access_token=${api_key}`;
    const response = await fetch(url);
    if (!response.ok) {
        return Infinity
    }
    const jsonData = await response.json();
    if (jsonData.routes.length === 0) {
        return {time: Infinity, route: null}
    }
    const duration = jsonData.routes[0].duration / 60;
    return {time: duration, route: jsonData.routes[0]};
}

module.exports = { calculateCommute } 