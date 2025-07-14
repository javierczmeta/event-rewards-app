import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

const Marker = ({ map, event }) => {

    const markerRef = useRef();

    useEffect(() => {
        markerRef.current = new mapboxgl.Marker()
            .setLngLat([event.longitude, event.latitude])
            .addTo(map)
            .setPopup(new mapboxgl.Popup().setHTML(`<h3>${event.name}</h3>`));

        return () => {
            markerRef.current.remove();
        };
    }, []);

    return null;
};

export default Marker;
