import "../styles/EventFeed.css";
import Event from "./Event";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import EventModal from "./EventModal";
import { Routes, Route } from "react-router";

const EventFeed = ({ searchFieldProps, sortState, isRecommending }) => {
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
            return axios.get(
                `${url}/events/recommended`,
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
                        <div>
                            <p>Loading...</p>
                        </div>
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
                        <div>
                            <p>Loading...</p>
                        </div>
                    )}
                    {getEvents.isError && <div>{getEvents.error}</div>}
                    {getEvents.isSuccess &&
                        getEvents.data.data.length === 0 && (
                            <h3>No Events to show...</h3>
                        )}
                    {getEvents.isSuccess &&
                        getEvents.data.data.map((event) => (
                            <Event key={event.id} event={event} />
                        ))}
                </div>
            )}

            <Routes>
                <Route path=":eventID" element={<EventModal />} />
                <Route path="*" element={<></>} />
            </Routes>
        </main>
    );
};

export default EventFeed;
