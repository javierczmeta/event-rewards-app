// Given a list of objects with an identifier, order them like another list consisting of ints
export function orderLike(objectList, orderList) {
    const res = objectList.toSorted((a,b) => {return orderList.indexOf(a.id) - orderList.indexOf(b.id)})
    return res
}