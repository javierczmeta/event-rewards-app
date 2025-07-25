import { useUser } from "../contexts/UserContext";
import "../styles/RootPage.css";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Event from "./Event";
import {GalleryVerticalEnd, DiamondPlus, Clock, Calendar} from 'lucide-react';
import UserImage from "./UserImage";
import LoaderEvent from "./LoaderEvent";
import { Routes, Route } from "react-router";
import EventModal from "./EventModal";

const RootPage = () => {
    const { user } = useUser();
    const navigate = useNavigate();

    const getEvents = useQuery({
        queryKey: ["organized-events", user.id],
        queryFn: () => {
            const url = import.meta.env.VITE_SERVER_API;
            return axios.get(`${url}/users/${user.id}/events`);
        },
        refetchOnWindowFocus: false,
        refetchInterval: 1000 * 60 * 5,
    });

    return (
        <main className="root-main">
            <div className="root-inner-container">
                <div className="welcome-container">
                    <UserImage image={user.profile.image} className="profile-img" alt={`Profile picture for ${user.profile.display_name}`} onClick={()=> {navigate(`users/${user.id}`)}}/>
                    <div>
                        <h2>Welcome {user.profile.display_name}!</h2>
                        <h3>{user.profile.points} points</h3>
                    </div>
                </div>
                
                <div className="root-buttons">
                    <button
                        className="root-button"
                        onClick={() => {
                            navigate("/feed");
                        }}
                    >
                        <GalleryVerticalEnd/> Browse Events
                    </button>
                    <button
                        className="root-button"
                        onClick={() => {
                            navigate("/create");
                        }}
                    >
                        <DiamondPlus/>Create Event
                    </button>
                    <button
                        className="root-button"
                        onClick={() => {
                            navigate("/schedule");
                        }}
                    >
                        <Clock/>Schedule
                    </button>
                    <button
                        className="root-button"
                        onClick={() => {
                            navigate("/calendar");
                        }}
                    >
                        <Calendar/>Calendar View
                    </button>
                </div>
                <div className="root-events-container">
                    <h4>Saved Events</h4>
                    <div className="organized-container">
                        {getEvents.isPending &&
                        <>
                            <LoaderEvent/>
                            <LoaderEvent/>
                            <LoaderEvent/>
                            <LoaderEvent/>
                        </>}
                        {getEvents.data &&
                            getEvents.data.data.saved_events.map((event) => (
                                <Event key={event.id} event={event} saved={true} navigatePage={''}/>
                            ))}
                    </div>
                </div>
                <div className="root-events-container">
                    <h4>My Events</h4>
                    <div className="organized-container">
                        {getEvents.isPending &&
                        <>
                            <LoaderEvent/>
                            <LoaderEvent/>
                            <LoaderEvent/>
                            <LoaderEvent/>
                        </>}
                        {getEvents.data &&
                            getEvents.data.data.organized_events.map((event) => (
                                <Event key={event.id} event={event} navigatePage={''}/>
                            ))}
                    </div>
                </div>
            </div>
            <Routes>
                <Route
                    path=":eventID"
                    element={<EventModal returnPage={"/"} />}
                />
                <Route path="*" element={<></>} />
            </Routes>
        </main>
    );
};

export default RootPage;
