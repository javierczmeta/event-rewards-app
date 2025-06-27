import "../styles/Event.css";
import { useQuery } from "@tanstack/react-query";
import axios from 'axios'

const Event = ({ event }) => {
    const date = new Date(event.start_time).toLocaleString();

    const getEventLocation = useQuery({
        queryKey: [event.id],
        queryFn: () => {
            const apiToken = import.meta.env.VITE_GEOCODING_TOKEN;
            const url = `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${event.longitude}&latitude=${event.latitude}&access_token=${apiToken}`;
            return axios.get(url);
        },
        refetchOnWindowFocus: false,
    });

    return (
        <div className="event-card">
            <div className="event-image">
                {event.image ? (
                    <img src={event.image} alt={event.name}></img>
                ) : (
                    <></>
                )}
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
