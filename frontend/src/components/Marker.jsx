import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { createPortal } from "react-dom";
import "../styles/Marker.css";
import EventImage from "./EventImage"
import { createDateWithOffset } from "../utils/createDateWithOffset";
import { useNavigate } from "react-router";

const Marker = ({ map, event }) => {
    const markerRef = useRef();
    const contentRef = useRef(document.createElement("div"));
    const date = createDateWithOffset(event.start_time)
    const navigate = useNavigate()

    useEffect(() => {
        markerRef.current = new mapboxgl.Marker(contentRef.current)
            .setLngLat([event.longitude, event.latitude])
            .addTo(map)

        return () => {
            markerRef.current.remove();
        };
    }, []);

    return (
        <>
            {createPortal(
                <div className="map-marker" onClick={() => {
                navigate(`/map/${event.id}`);
            }}>
                    <EventImage image={event.image} alt={event.name} className="map-marker-image"/>
                    <h4 className="more-info">{event.name}</h4>
                    <p className="more-info">{date.toDateString()}</p>
                    <p className="more-info">{date.toLocaleTimeString()}</p>
                </div>,
                contentRef.current
            )}
        </>
    );
};

export default Marker;
