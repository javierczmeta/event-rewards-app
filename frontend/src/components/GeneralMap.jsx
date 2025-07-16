import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import Marker from "./Marker";
import { useUser } from "../contexts/UserContext";

const GeneralMap = ({ className, fetchEvents, mapEvents, mapRef }) => {
    const mapContainerRef = useRef();
    const {location, MENLO_PARK_COORDS} = useUser()

    let mapStartPos = location ? location : MENLO_PARK_COORDS

    const currentMarkers = [];

    const getEventsWithBounds = () => {
        currentMarkers.forEach((marker) => mapRef.current.removeLayer(marker));
        const bounds = mapRef.current.getBounds();

        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();

        fetchEvents([sw.lng, sw.lat, ne.lng, ne.lat]);
    };

    const mapboxToken = import.meta.env.VITE_GEOCODING_TOKEN;
    useEffect(() => {
        mapboxgl.accessToken = mapboxToken;
        mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            center: [mapStartPos.lng, mapStartPos.lat], // starting position [lng, lat]
            zoom: 15, // starting zoom
        });

        mapRef.current.on("load", () => {
            getEventsWithBounds();
        });

        mapRef.current.on("moveend", () => {
            getEventsWithBounds();
        });

        return () => {
            mapRef.current.remove();
        };
    }, []);

    return (
        <>
            <div ref={mapContainerRef} className={className}></div>
            {mapRef.current &&
                mapEvents &&
                mapEvents.map((event) => {
                    return (
                        <Marker
                            key={event.id}
                            map={mapRef.current}
                            event={event}
                        />
                    );
                })}
        </>
    );
};

export default GeneralMap;
