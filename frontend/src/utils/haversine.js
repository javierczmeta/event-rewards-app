/**
 * Returns the distance between 2 sets of cordinates. Adapted from https://community.esri.com/t5/coordinate-reference-systems-blog/distance-on-a-sphere-the-haversine-formula/ba-p/902128
 * @param {object} coords1 {lon, lat}
 * @param {object} coords2 {lon, lat}
 * @returns object with distance in meters and kilometers
 */
export function haversine(coords1, coords2) {
    const {lon: lon1, lat: lat1} = coords1
    const {lon: lon2, lat: lat2} = coords2

    const EARTH_RADIUS = 6371000
    const phi1 = lat1 * (Math.PI / 180)
    const phi2 = lat2 * (Math.PI / 180)

    const deltaPhi = (lat2 - lat1) * (Math.PI / 180)
    const deltaLambda = (lon2 - lon1) * (Math.PI / 180)

    const a = Math.sin(deltaPhi / 2.0) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2.0) ** 2

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

    let meters = EARTH_RADIUS * c
    let km = meters / 1000

    meters = Math.round(meters * 1000) / 1000
    km = Math.round(km * 1000) / 1000

    return {meters, km}
}
