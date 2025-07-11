import EventImage from "./EventImage";
import "../styles/MapEventCard.css";
import { useReverseGeocoding } from "../utils/useReverseGeocoding";
import { useNavigate } from "react-router";

const MapEventCard = ({ event }) => {
    const getEventLocation = useReverseGeocoding(
        event.id,
        event.longitude,
        event.latitude
    );

    const navigate = useNavigate();

    return (
        <div className="map-event-card" onClick={() => {
                navigate(`/feed/${event.id}`);
            }}>
            <EventImage image={event.image} className="map-event-image" />
            <h2>{event.name}</h2>
            <p className="map-event-address">
                {getEventLocation.isSuccess && getEventLocation.data.data.features[0] &&
                    getEventLocation.data.data.features[0].properties
                        .place_formatted}
            </p>
        </div>
    );
};

export default MapEventCard;
