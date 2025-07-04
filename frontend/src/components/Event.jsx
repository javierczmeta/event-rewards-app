import "../styles/Event.css";
import { createDateWithOffset } from "../utils/createDateWithOffset";
import { useReverseGeocoding } from "../utils/useReverseGeocoding";
import { useNavigate } from "react-router";
import { useUser } from "../contexts/UserContext";

const Event = ({ event }) => {
    const date = createDateWithOffset(event.start_time).toLocaleString();
    const navigate = useNavigate();

    const { user } = useUser();

    const getEventLocation = useReverseGeocoding(
        event.id,
        event.longitude,
        event.latitude
    );

    return (
        <div
            className="event-card"
            onClick={() => {
                navigate(`/feed/${event.id}`);
            }}
        >
            <div className="event-image">
                {event.image ? (
                    <img
                        src={event.image}
                        alt={`Image for the event: ${event.name}`}
                    ></img>
                ) : (
                    <img
                        src="./event_placeholder.svg"
                        alt={`Placeholder Image`}
                    ></img>
                )}
            </div>
            <div className="event-info">
                <h2>{event.name}</h2>
                <p>{date}</p>
                <p>
                    {getEventLocation.isError && `Error Fetching Location`}
                    {getEventLocation.isPending && "Fetching Location"}
                    {getEventLocation.isSuccess &&
                        getEventLocation.data.data.features[0] &&
                        getEventLocation.data.data.features[0].properties
                            .place_formatted}
                </p>
                <p>{event.price}</p>
                <p>{event.rewards} point(s)</p>
            </div>
            <div className="event-description">
                <div className="tag-container">
                    {user.id === event.organizer_id ? (
                        <div className="tag mine">My Event</div>
                    ) : (
                        <></>
                    )}
                    <div className="tag">
                        {event.category}
                    </div>
                </div>
                <p>{event.description}</p>
            </div>
        </div>
    );
};

export default Event;
