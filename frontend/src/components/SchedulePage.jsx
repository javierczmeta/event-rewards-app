import { useUser } from "../contexts/UserContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import LoaderEvent from "./LoaderEvent";
import Event from "./Event";
import "../styles/SchedulePage.css";
import { Check } from "lucide-react";
import axios from "axios";
import LoadingGif from "./LoadingGif";
import { useState } from "react";
import SchedulingOptions from "./SchedulingOptions";
import { ToastContainer, toast, Slide } from "react-toastify";
import Itinerary from "./Itinerary";
import { Routes, Route } from "react-router";
import EventModal from "./EventModal";



const SchedulePage = () => {
    const { user, location } = useUser();
    const [withCommute, setWithCommute] = useState(false);
    const [profitModes, setProfitModes] = useState(
                                                    {points: {weight: 0.5, on: true}, 
                                                    distance: {weight: 0.5, on: false}, 
                                                    price: {weight: 0.5, on: false}});

    const [showItinerary, setShowItinerary] = useState(false);
    const [selectedEventIds, setSelectedEventIds] = useState([])
    const [commutes, setCommutes] = useState([])

    const getEvents = useQuery({
        queryKey: ["organized-events", user.id],
        queryFn: () => {
            const url = import.meta.env.VITE_SERVER_API;
            return axios.get(`${url}/users/${user.id}/events`);
        },
        refetchOnWindowFocus: false,
        refetchInterval: 1000 * 60 * 5,
    });

    const scheduleMutation = useMutation({
        mutationFn: (args) => {
            const url = import.meta.env.VITE_SERVER_API;
            const body = {
                events: args.events,
                profitModes: args.profitModes,
            };
            if (location) {
                body.userLocation = location;
            }
            return axios.post(
                `${url}/events/schedule?commute=${args.commute}`,
                body,
                {
                    withCredentials: true,
                }
            );
        },
        onSuccess: (data) => {
            toast.success("⭐ Success!");
            setSelectedEventIds(data.data.selectedEventIds)
            setCommutes(data.data.finalCommutes)
            setShowItinerary(true)
        },
        onError: (error) => {
            toast.error(error.response.data.message);
        },
    });

    if (getEvents.isError) {
        return (
            <main className="schedule-main">
                <h2>Error fetching events. Try again later</h2>
            </main>
        );
    }

    return (
        <main className="schedule-main">
            <div className="schedule-events-container">
                <div className="schedule-header">
                    <div>
                        <h2>Events to Schedule:</h2>
                        <p className="schedule-desc">
                            Save events to see them here!
                        </p>
                    </div>
                    <SchedulingOptions
                        withCommute={withCommute}
                        setWithCommute={setWithCommute}
                        profitModes={profitModes}
                        setProfitModes={setProfitModes}
                    />
                </div>

                <div className="organized-container">
                    {getEvents.isPending && (
                        <>
                            <LoaderEvent />
                            <LoaderEvent />
                            <LoaderEvent />
                            <LoaderEvent />
                        </>
                    )}
                    {getEvents.data &&
                        getEvents.data.data.saved_events.toSorted((a,b) => {return (new Date(a.start_time)) - (new Date(b.start_time))}).map((event) => (
                            <Event key={event.id} event={event} saved={true} navigatePage={"/schedule"}/>
                        ))}
                </div>

                <div className="schedule-buttons">
                    {getEvents.isLoading && <LoadingGif />}
                    {getEvents.isSuccess &&
                        getEvents.data.data.saved_events.length >= 2 && (
                            <button
                                className="schedule-button"
                                onClick={() => {
                                    const modes = Object.keys(profitModes).filter(x => profitModes[x].on && profitModes[x].weight > 0).map(x => {return {name: x, weight: profitModes[x].weight}})
                                    if (modes.length < 1) {
                                        toast.error("Must select at least 1 profit mode with weight > 0")
                                        return
                                    }
                                    scheduleMutation.mutate({
                                        events: getEvents.data.data
                                            .saved_events,
                                        commute: withCommute,
                                        profitModes: modes,
                                    });
                                }}
                            >
                                <Check /> Looks good
                            </button>
                        )}
                    {getEvents.isSuccess &&
                        getEvents.data.data.saved_events.length < 2 && (
                            <p>Save 2 or more events!</p>
                        )}
                </div>
            </div>
            {showItinerary && <Itinerary setShowItinerary={setShowItinerary} events={getEvents.data.data.saved_events} selectedEventIds={selectedEventIds} commutes={commutes}/>}
            <Routes>
                <Route
                    path=":eventID"
                    element={<EventModal returnPage={"/schedule"} />}
                />
                <Route path="*" element={<></>} />
            </Routes>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss={false}
                draggable={false}
                pauseOnHover
                theme="light"
                transition={Slide}
            />
        </main>
    );
};

export default SchedulePage;
