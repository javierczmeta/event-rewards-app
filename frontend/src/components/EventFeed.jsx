import "../styles/EventFeed.css";
import Event from "./Event";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import EventModal from "./EventModal";
import { Routes, Route } from "react-router";
import LoaderEvent from "./LoaderEvent";
import { useUser } from "../contexts/UserContext";

const EventFeed = ({ searchFieldProps, sortState, isRecommending, checkboxData, filterOptions }) => {
    const {user, location} = useUser()

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
                            <Event key={event.id} event={event} />
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
                        getEvents.data.data.length === 0 && (
                            <h3>No Events to show...</h3>
                        )}
                    {getEvents.isSuccess &&
                        getEvents.data.data.map((event) => {
                            return <Event key={event.id} event={event} saved={event.profiles_saved.filter(saved_user => saved_user.user_id === user.id).length > 0} navigatePage={"/feed"}/>
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
