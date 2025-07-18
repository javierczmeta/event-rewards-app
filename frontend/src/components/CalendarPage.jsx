import "../styles/CalendarPage.css";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useUser } from "../contexts/UserContext";
import { useState } from "react";
import { createDateWithOffset } from "../utils/createDateWithOffset";
import { useNavigate } from "react-router";
import { Routes, Route } from "react-router";
import EventModal from "./EventModal";
import { useEffect } from "react";

const CalendarPage = () => {
    const { user } = useUser();
    const [events, setEvents] = useState();
    const [displayOption, setDisplayOption] = useState("all");
    const navigate = useNavigate();

    const getAllEvents = useQuery({
        queryKey: ["events"],
        queryFn: () => {
            const url = import.meta.env.VITE_SERVER_API;
            return axios.get(`${url}/events`, {
                withCredentials: true,
            });
        },
        refetchOnWindowFocus: false,
    });

    const getEventsGoing = useQuery({
        queryKey: ["eventsGoing", user.id],
        queryFn: () => {
            const url = import.meta.env.VITE_SERVER_API;
            return axios.get(`${url}/users/${user.id}/going`);
        },
        refetchOnWindowFocus: false,
    });

    const handleEventClick = (info) => {
        navigate(`/calendar/${info.event.id}`);
    };

    useEffect(() => {
        if (displayOption === "all" && getAllEvents.isSuccess) {
            setEvents(
                getAllEvents.data.data.map((event) => {
                    return {
                        id: event.id,
                        title: event.name,
                        start: createDateWithOffset(event.start_time),
                        end: createDateWithOffset(event.end_time),
                        color: 'purple'
                    };
                })
            );
        } else if (displayOption === "going" && getAllEvents.isSuccess) {
            setEvents(
                getEventsGoing.data.data.map((event) => {
                    return {
                        id: event.event.id,
                        title: event.event.name,
                        start: createDateWithOffset(event.event.start_time),
                        end: createDateWithOffset(event.event.end_time),
                    };
                })
            );
        } else {
            setEvents([]);
        }
    }, [getAllEvents.status, getEventsGoing.status, displayOption]);

    return (
        <main className="calendar-main">
            <div className="calendar-container">
                {displayOption === "all" ? (
                    <div
                        className="schedule-button"
                        onClick={() => {
                            setDisplayOption("going");
                        }}
                    >
                        Showing All Events
                    </div>
                ) : (
                    <div
                        className="schedule-button"
                        onClick={() => {
                            setDisplayOption("all");
                        }}
                    >
                        Showing Events You are Going
                    </div>
                )}

                <FullCalendar
                    plugins={[dayGridPlugin]}
                    initialView="dayGridMonth"
                    height="800px"
                    fixedWeekCount={false}
                    events={events}
                    eventColor="#E04F4F"
                    eventClick={handleEventClick}
                />
            </div>

            <Routes>
                <Route
                    path=":eventID"
                    element={<EventModal returnPage={"/calendar"} />}
                />
                <Route path="*" element={<></>} />
            </Routes>
        </main>
    );
};

export default CalendarPage;
