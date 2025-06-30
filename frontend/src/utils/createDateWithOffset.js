export const createDateWithOffset = (isoDate) => {
    const clientDate = new Date()
    const offset = clientDate.getTimezoneOffset() * 60 * 1000

    let originalDate = new Date(isoDate) 

    let adjustedDate = new Date(originalDate.getTime() + offset);

    return adjustedDate
}