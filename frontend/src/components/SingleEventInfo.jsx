import { createDateWithOffset } from "../utils/createDateWithOffset";
import { useReverseGeocoding } from "../utils/useReverseGeocoding";
import { useUser } from "../contexts/UserContext";
import EventDeleteButton from "./EventDeleteButton";
import RSVP from "./RSVP";
import CheckIn from "./CheckIn";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import UserImage from "./UserImage";
import UserBadge from "./UserBadge";

const SingleEventInfo = ({ chosenEvent }) => {
    const startDate = createDateWithOffset(chosenEvent.start_time);
    const endDate = createDateWithOffset(chosenEvent.end_time);

    const { user } = useUser();

    const getEventLocation = useReverseGeocoding(
        chosenEvent.id,
        chosenEvent.longitude,
        chosenEvent.latitude
    );

    return (
        <aside
            className="modal-content"
            onClick={(e) => {
                e.stopPropagation();
            }}
        >
            <img
                src={chosenEvent.image}
                alt={"Image for " + chosenEvent.name}
                className="modal-image"
            ></img>
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
                    <div className="tag">
                        {chosenEvent.category}
                    </div>
                </div>
                <p>
                    <span>Organizer: </span>
                </p>
                <div className="organizer-section">
                    <div className="organizer-image">
                        <UserImage
                            image={chosenEvent.organizer.profile.image}
                                alt={`Profile picture for ${chosenEvent.organizer.profile.display_name}`}
                            ></img>
                        ) : (
                            <img src="../pfp_placeholder.jpg" alt={`Profile picture for ${chosenEvent.organizer.profile.display_name}`}></img>
                        )}
                    </div>
                    <p className="organizer-name">
                        {chosenEvent.organizer.profile.display_name}
                    </p>
                </div>
            </div>
            <p className="span-grid">Description: {chosenEvent.description}</p>
            <p className="span-grid">
                <span>People Going: </span>
            </p>
            <div className="span-grid status-container">
                <p>
                    <span>Your status:</span>
                </p>
                {user.id === chosenEvent.organizer_id ? <><p> Organizer: </p> <CheckIn/> </> : <RSVP />}
            </div>
            {user.id === chosenEvent.organizer_id ? (
                <EventDeleteButton eventId={chosenEvent.id} />
            ) : (
                <></>
            )}
        </aside>
    );
};

export default SingleEventInfo;
