import EventImage from "./EventImage";
import "../styles/MapEventCard.css";
import { useReverseGeocoding } from "../utils/useReverseGeocoding";

const MapEventCard = ({ event, mapRef }) => {
    const getEventLocation = useReverseGeocoding(
        event.id,
        event.longitude,
        event.latitude
    );

    return (
        <div
            className="map-event-card"
            onClick={() => {
                mapRef.current.flyTo({
                    center: [event.longitude, event.latitude],
                    zoom: 20,
                });
            }}
        >
            <EventImage image={event.image} className="map-event-image" />
            <h2>{event.name}</h2>
            <p className="map-event-address">
                {getEventLocation.isSuccess &&
                    getEventLocation.data.data.features[0] &&
                    getEventLocation.data.data.features[0].properties
                        .place_formatted}
            </p>
        </div>
    );
};

export default MapEventCard;
