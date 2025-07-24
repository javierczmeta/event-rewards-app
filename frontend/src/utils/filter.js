import { haversine } from "./haversine"

export function filter(events, checkboxData, filterData, location) {
    let newEvents = JSON.parse(JSON.stringify(events))

    if (checkboxData.after && filterData.afterProps.value) {
        newEvents = newEvents.filter(event => (new Date(event.start_time)) >= (new Date(filterData.afterProps.value)))
    }

    if (checkboxData.before && filterData.beforeProps.value) {
        newEvents = newEvents.filter(event => (new Date(event.end_time)) <= (new Date(filterData.beforeProps.value)))
    }

    if (checkboxData.closer && location && filterData.closerProps.value) {
        newEvents = newEvents.filter(event => {
            const distanceKM = haversine({lon: event.longitude, lat: event.latitude}, {lon: location.lng, lat: location.lat}).km
            return distanceKM <= filterData.closerProps.value
        })
    }

    if (checkboxData.category && filterData.categoryProps.value) {
        newEvents = newEvents.filter(event => event.category === filterData.categoryProps.value)
    }

    return newEvents
}
