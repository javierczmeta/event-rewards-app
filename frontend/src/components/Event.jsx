import "../styles/Event.css";

const Event = ({ event }) => {
    const date = new Date(event.start_time).toLocaleString();

    return (
        <div className="event-card">
            <div className="event-image"></div>
            <div className="event-info">
                <h2>{event.name}</h2>
                <p>{date}</p>
                <p>
                    Placeholder location {event.latitude} {event.longitude}
                    {/* Will use geocoder api to get location */}
                </p>
                <p>{event.price}</p>
                <p>{event.rewards} point(s)</p>
                <div className="tag-container">
                    {event.tags
                        ? event.tags.map((tag) => (
                                <div className="tag">{tag}</div>
                            ))
                        : "No tags"}
                </div>
            </div>
            <div className="event-description">
                <p>
                    {event.description}
                </p>
            </div>
        </div>
    );
};

export default Event;
