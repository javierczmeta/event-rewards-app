import { createDateWithOffset } from "../utils/createDateWithOffset";
import { useReverseGeocoding } from "../utils/useReverseGeocoding";
import { useUser } from "../contexts/UserContext";
import EventDeleteButton from "./EventDeleteButton";
import RSVP from "./RSVP";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import UserImage from "./UserImage";
import UserBadge from "./UserBadge";
import EventImage from "./EventImage";
import { useState, useEffect } from "react";
import Reviews from "./Reviews";

const SingleEventInfo = ({ chosenEvent }) => {
    const startDate = createDateWithOffset(chosenEvent.start_time);
    const endDate = createDateWithOffset(chosenEvent.end_time);

    const { user } = useUser();

    const MAX_ATTENDEES_SHOWN = 10;

    const getEventLocation = useReverseGeocoding(
        chosenEvent.id,
        chosenEvent.longitude,
        chosenEvent.latitude
    );

    const getAttendees = useQuery({
        queryKey: ["attendees", chosenEvent.id],
        queryFn: () => {
            const url = import.meta.env.VITE_SERVER_API;
            return axios.get(`${url}/events/${chosenEvent.id}/attendees/`);
        },
        staleTime: 1000 * 60 * 5
    });

    const [mousePosition, setMousePosition] = useState({x:0, y:0});

    useEffect(() => {
        const updateMosePosition = (e) => {
            setMousePosition({x: e.clientX, y: e.clientY});
        }

        window.addEventListener('mousemove', updateMosePosition)

        return () => {
            window.removeEventListener('mousemove', updateMosePosition)
        }
    },[]);

    return (
        <aside
            className="modal-content"
            onClick={(e) => {
                e.stopPropagation();
            }}
        >
            <EventImage image={chosenEvent.image} className="modal-image" alt={`Image for the event: ${chosenEvent.name}`}/>
            <div className="modal-event-info">
                <h2 className="modal-event-title">{chosenEvent.name}</h2>
                <div className="time-info">
                    <p className="span-grid">
                        <span>When?</span> {startDate.toLocaleDateString()}
                    </p>
                    <p>Starts at {startDate.toLocaleTimeString()}</p>
                    <p>Ends at {endDate.toLocaleTimeString()}</p>
                </div>
                {getEventLocation.isSuccess && (
                    <p>
                        <span>Where? </span>
                        {getEventLocation.data.data.features[0] &&
                            getEventLocation.data.data.features[0].properties
                                .full_address}
                    </p>
                )}
                <p>
                    <span>Price:</span> {chosenEvent.price}
                </p>
                <p>
                    <span>Points:</span> {chosenEvent.rewards} points
                </p>
                <div className="tag-container">
                    <div className="tag">{chosenEvent.category}</div>
                </div>
                <p>
                    <span>Organizer: </span>
                </p>
                <div className="organizer-section">
                    <div className="organizer-image">
                        <UserImage
                            image={chosenEvent.organizer.profile.image}
                            alt={`Profile picture for ${chosenEvent.organizer.profile.display_name}`}
                        />
                    </div>
                    <p className="organizer-name">
                        {chosenEvent.organizer.profile.display_name}
                    </p>
                </div>
            </div>
            <p className="span-grid">Description: {chosenEvent.description}</p>
            <div className="span-grid user-container">
                <p>
                    <span>People Going: </span>
                </p>
                {getAttendees.isSuccess ?
                    (<>{getAttendees.data.data.slice(0,MAX_ATTENDEES_SHOWN).map((rsvp) => {
                        return (
                            <UserBadge
                                key={rsvp.user_id}
                                profile={rsvp.user.profile}
                                mousePosition={mousePosition}
                                badgeClass='badge'
                                checkedIn={rsvp.check_in_time !== null}
                            />
                        );
                    })}
                    {getAttendees.data.data.length > MAX_ATTENDEES_SHOWN ? <p>+ {getAttendees.data.data.length - MAX_ATTENDEES_SHOWN} other(s)</p> : <></>}
                </>) : <></>}
            </div>
            <div className="span-grid status-container">
                
                {user.id === chosenEvent.organizer_id ? (
                    <>
                        <p><span>Your Event Code:</span> {chosenEvent.code}</p> 
                    </>
                ) : (
                    <>
                    <p><span>Your status:</span></p>
                    <RSVP />
                    </>
                    
                )}
            </div>
            <Reviews eventId={chosenEvent.id}/>
            {user.id === chosenEvent.organizer_id ? (
                <EventDeleteButton eventId={chosenEvent.id} />
            ) : (
                <></>
            )}
            
        </aside>
    );
};

export default SingleEventInfo;
