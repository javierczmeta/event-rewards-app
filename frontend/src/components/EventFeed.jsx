import "../styles/EventFeed.css";
import Event from "./Event";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import EventModal from "./EventModal";
import { Routes, Route } from "react-router";
import LoaderEvent from "./LoaderEvent";
import { useUser } from "../contexts/UserContext";
import { useEffect, useState } from "react";
import { filter } from "../utils/filter";
import { useFeed } from "../contexts/FeedContext";

const EventFeed = () => {
    const {location, savedEvents} = useUser()
    const {searchFieldProps, sortState, isRecommending, checkboxData, filterOptions, needsFiltering, setNeedsFiltering} = useFeed()

    const [shownEvents, setShownEvents] = useState([]);

    const getEvents = useQuery({
        queryKey: ["events", searchFieldProps.value, sortState],
        queryFn: () => {
            const url = import.meta.env.VITE_SERVER_API;
            return axios.get(
                `${url}/events?search=${searchFieldProps.value}&sort=${sortState}`,
                {
                    withCredentials: true,
                }
            );
        },
        refetchOnWindowFocus: false,
        refetchInterval: 1000 * 60 * 5,
        staleTime: 0,
    });

    const getRecommended = useQuery({
        queryKey: ["recommended-events"],
        queryFn: () => {
            const url = import.meta.env.VITE_SERVER_API;
            const endpoint = location ? `${url}/events/recommended?lng=${location.lng}&lat=${location.lat}` : `${url}/events/recommended`
            return axios.get(
                endpoint,
                {
                    withCredentials: true,
                }
            );
        },
        refetchOnWindowFocus: false,
        refetchInterval: 1000 * 60,
        staleTime: 0,
    });

    useEffect(() => {
        if (getEvents.isSuccess) {
            setShownEvents(filter(getEvents.data.data, checkboxData, filterOptions, location))
            setNeedsFiltering(false)
        }
    }, [getEvents.data, needsFiltering])

    return (
        <main className="feed-main">
            {isRecommending ? (
                <div className="events-container">
                    {getRecommended.isPending && (
                        <>
                            <LoaderEvent/>
                            <LoaderEvent/>
                            <LoaderEvent/>
                            <LoaderEvent/>
                        </>
                    )}
                    {getRecommended.isError && <div>{getEvents.error}</div>}
                    {getRecommended.isSuccess &&
                        getRecommended.data.data.length === 0 && (
                            <h3>No Events to show...</h3>
                        )}
                    {getRecommended.isSuccess &&
                        getRecommended.data.data.map((event) => (
                            <Event key={event.id} event={event} navigatePage={"/feed"}/>
                        ))}
                </div>
            ) : (
                <div className="events-container">
                    {getEvents.isPending && (
                        <>
                            <LoaderEvent/>
                            <LoaderEvent/>
                            <LoaderEvent/>
                            <LoaderEvent/>
                        </>
                    )}
                    {getEvents.isError && <div>{getEvents.error}</div>}
                    {getEvents.isSuccess &&
                        shownEvents.length === 0 && (
                            <h3>No Events to show...</h3>
                        )}
                    {getEvents.isSuccess &&
                        shownEvents.map((event) => {
                            return <Event key={event.id} event={event} saved={savedEvents.has(event.id)} navigatePage={"/feed"}/>
})}
                </div>
            )}

            <Routes>
                <Route path=":eventID" element={<EventModal returnPage={'/feed'}/>} />
                <Route path="*" element={<></>} />
            </Routes>
        </main>
    );
};

export default EventFeed;
