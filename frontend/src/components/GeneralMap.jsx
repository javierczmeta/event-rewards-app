import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const GeneralMap = ({className}) => {
    const mapContainerRef = useRef();
    const mapRef = useRef();

    const mapboxToken = import.meta.env.VITE_GEOCODING_TOKEN;
    useEffect(() => {
        mapboxgl.accessToken = mapboxToken;
        mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            center: [-122.150436, 37.48187], // starting position [lng, lat]
            zoom: 15, // starting zoom
        });

        return () => {
            mapRef.current.remove();
        };
    }, []);

    return <div ref={mapContainerRef} className={className}></div>;
}

export default GeneralMap;