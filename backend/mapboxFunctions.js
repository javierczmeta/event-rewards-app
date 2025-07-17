/**
 * Calculates driving commute time between two locations using mapbox api
 * @param {object} eventA
 * @param {object} eventB
 * @returns {number} commute time
 */
async function calculateCommute(eventA, eventB) {
    // Placeholder function
    const api_key = process.env.MAPBOX_TOKEN;
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${eventA.longitude},${eventA.latitude};${eventB.longitude},${eventB.latitude}?access_token=${api_key}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
    }
    const jsonData = await response.json();
    if (jsonData.routes.length === 0) {
        return Infinity
    }
    const duration = jsonData.routes[0].duration / 60;
    return duration;
}

module.exports = { calculateCommute } 