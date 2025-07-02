import "../styles/Event.css";
import { useReverseGeocoding } from "../utils/useReverseGeocoding";

const Event = ({ event }) => {
    const date = new Date(event.start_time).toLocaleString();

    const getEventLocation = useReverseGeocoding(event.id, event.longitude, event.latitude)

    return (
        <div className="event-card">
            <div className="event-image">
               {event.image ? <img src={event.image} alt={`Image for the event: ${event.name}`}></img> : <img src='./event_placeholder.svg' alt={`Placeholder Image`}></img>}
            </div>
            <div className="event-info">
                <h2>{event.name}</h2>
                <p>{date}</p>
                <p>
                    {getEventLocation.isError && `Error Fetching Location`}
                    {getEventLocation.isPending && "Fetching Location"}
                    {getEventLocation.isSuccess && getEventLocation.data.data.features[0].properties.context.place.name}
                </p>
                <p>{event.price}</p>
                <p>{event.rewards} point(s)</p>
                <div className="tag-container">
                    {event.tags
                        ? event.tags.map((tag, index) => (
                                <div key={index} className="tag">{tag}</div>
                            ))
                        : "No tags"}
                </div>
            </div>
            <div className="event-description">
                <p>{event.description}</p>
            </div>
        </div>
    );
};

export default Event;
