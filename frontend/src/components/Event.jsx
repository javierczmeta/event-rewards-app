import "../styles/Event.css";
import { createDateWithOffset } from "../utils/createDateWithOffset";
import { useReverseGeocoding } from "../utils/useReverseGeocoding";
import { useNavigate } from "react-router";
import { useUser } from "../contexts/UserContext";
import EventImage from "./EventImage";
import interpolate from "color-interpolate"

const Event = ({ event }) => {
    const date = createDateWithOffset(event.start_time).toLocaleString();
    const navigate = useNavigate();

    const { user } = useUser();

    const getEventLocation = useReverseGeocoding(
        event.id,
        event.longitude,
        event.latitude
    );

    let similarity;
    let style;
    if (event.multiplier) {
        similarity = Math.round(((event.multiplier + 1) / 2) * 10000) / 100;

        let colormap = interpolate(['#4B04A1', '#238C8D', '#47BD6F'])
        let bg_color = colormap((event.multiplier + 1)/2)
        style = {backgroundColor: bg_color}
    }

    return (
        <div
            className="event-card"
            onClick={() => {
                navigate(`/feed/${event.id}`);
            }}
        >
            <div className="event-image">
                <EventImage
                    image={event.image}
                    alt={`Image for the event: ${event.name}`}
                />
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
                    <div className="tag">{event.category}</div>
                    {similarity ? (
                        <div className="tag" style={style}>
                            <h4>{similarity}% Similarity</h4>
                        </div>
                    ) : (
                        <></>
                    )}
                </div>
                <p>{event.description}</p>
            </div>
        </div>
    );
};

export default Event;
