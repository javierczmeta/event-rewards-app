import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import LoadingGif from "./LoadingGif";
import UserImage from "./UserImage";
import "../styles/UserPage.css";
import Badge from "./Badge";
import { useMemo } from "react";
import HistoryEvent from "./HistoryEvent";
import { useUser } from "../contexts/UserContext";
import { useState, useEffect } from "react";
import BadgeSelector from "./BadgeSelector";
import { orderLike } from "../utils/sortObjectsWithList";
import { Route, Routes } from "react-router";
import EventModal from "./EventModal";


const UserPage = () => {
    const { userId } = useParams();
    const {user} = useUser()

    const [isEditing, setIsEditing] = useState(false)

    const getUser = useQuery({
        queryKey: ["user", userId],
        queryFn: () => {
            const url = import.meta.env.VITE_SERVER_API;
            return axios.get(`${url}/users/${userId}`);
        },
        refetchOnWindowFocus: false,
    });

    const rsvps = useMemo(() => { if (getUser.isSuccess) {return getUser.data.data.rsvps} else {return []}}, [getUser.data])
    const [mousePosition, setMousePosition] = useState({x:0, y:0});

    useEffect(() => {
        const updateMousePosition = (e) => {
            setMousePosition({x: e.clientX, y: e.clientY});
        }

        window.addEventListener('mousemove', updateMousePosition)

        return () => {
            window.removeEventListener('mousemove', updateMousePosition)
        }
    },[]);

    if (getUser.isPending) {
        return (
            <main className="modal-content">
                <LoadingGif />
            </main>
        );
    }

    if (getUser.isError) {
        console.log(getUser.error)
        return (<main className="user-error-main">
            <h2>Error: {getUser.error.message}</h2>
            <p>{getUser.error.response.data.message}</p>
        </main>)
    }


    const displayedBadges = orderLike(getUser.data.data.profile.display_badges, getUser.data.data.profile.badge_order)

    return (<>
        <main className="user-main">
            <div className="profile-info-container">
                <div className="user-page-info-main">
                    <UserImage
                        image={getUser.data.data.profile.image}
                        className="user-page-image"
                    />
                    <div className="user-page-info">
                        <h2>{getUser.data.data.profile.display_name}</h2>
                        <p>{getUser.data.data.profile.points} points</p>
                        <h4>Badges:</h4>
                        <div className="badge-display">
                            {displayedBadges.length ? (
                                displayedBadges.map(
                                    (badge) => {
                                        return <Badge key={badge.id} badge={badge} className='user-page-badge' mousePosition={mousePosition}/>;
                                    }
                                )
                            ) : (
                                <p>No badges displayed...</p>
                            )}
                        </div>
                        {user.id == userId ? <button className="edit-badge-button" onClick={() => {setIsEditing(true)}}>Edit Badges</button> : <></>}
                    </div>
                </div>
                <div className="milestone-container">
                    <h3>Next Milestone</h3>
                    <div className="bar-container">
                        <p className="milestone-text">Next badge <span>{getUser.data.data.nextBadge.name}</span>{` at ${getUser.data.data.nextBadge.requirement} point(s)`}</p>
                        <progress className="progress-bar" value={getUser.data.data.profile.points} max={getUser.data.data.nextBadge.requirement}></progress>
                    </div>
                </div>
                <div className="user-history-feed">
                    {rsvps.map(rsvp => {
                        return <HistoryEvent key={rsvp.id} name={getUser.data.data.profile.display_name} rsvp={rsvp}/>
                    })}
                </div>
            </div>
            {isEditing && <BadgeSelector badges={getUser.data.data.profile.badges} setIsEditing={setIsEditing} display_badges={displayedBadges}/>}
            <Routes>
                <Route
                    path=":eventID"
                    element={<EventModal returnPage={`/users/${user.id}`} />}
                />
                <Route path="*" element={<></>} />
            </Routes>
        </main>
        
            </>
    );
};

export default UserPage;
