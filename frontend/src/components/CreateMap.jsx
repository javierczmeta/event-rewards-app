import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const CreateMap = () => {
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

        mapRef.current.on("click", (e) => {
            console.log(`A click event has occurred at ${e.lngLat}`);
        });

        return () => {
            mapRef.current.remove();
        };
    }, []);

    return <div ref={mapContainerRef} className="map-container"></div>;
};

export default CreateMap;
