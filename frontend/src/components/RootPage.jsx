import { useUser } from "../contexts/UserContext";
import "../styles/RootPage.css";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Event from "./Event";
import {GalleryVerticalEnd, DiamondPlus} from 'lucide-react';
import UserImage from "./UserImage";
import LoaderEvent from "./LoaderEvent";

const RootPage = () => {
    const { user } = useUser();
    const navigate = useNavigate();

    const getOrganizedEvents = useQuery({
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
            <div className="welcome-container">
                <UserImage image={user.profile.image} className="profile-img" alt={`Profile picture for ${user.profile.display_name}`}/>
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
            </div>
            <div>
                <h4>My Events</h4>
                <div className="organized-container">
                    {getOrganizedEvents.isPending && 
                    <>
                        <LoaderEvent/>
                        <LoaderEvent/>
                        <LoaderEvent/>
                        <LoaderEvent/>
                    </>}
                    {getOrganizedEvents.data &&
                        getOrganizedEvents.data.data.map((event) => (
                            <Event key={event.id} event={event} />
                        ))}
                </div>
            </div>
        </main>
    );
};

export default RootPage;
