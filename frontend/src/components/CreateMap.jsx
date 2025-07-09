import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const CreateMap = ({formInputs}) => {
    const mapContainerRef = useRef();
    const mapRef = useRef();

    const mapboxToken = import.meta.env.VITE_GEOCODING_TOKEN;
    useEffect(() => {
        mapboxgl.accessToken = mapboxToken;
        mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            center: [formInputs.longitudeProps.value, formInputs.latitudeProps.value], // starting position [lng, lat]
            zoom: 15, // starting zoom
        });

        const marker = new mapboxgl.Marker()
            .setLngLat([formInputs.longitudeProps.value, formInputs.latitudeProps.value])
            .addTo(mapRef.current);

        mapRef.current.on("click", (e) => {
            formInputs.longitudeProps.setValue(e.lngLat.lng)
            formInputs.latitudeProps.setValue(e.lngLat.lat)
            marker.setLngLat([e.lngLat.lng, e.lngLat.lat]);
        });

        return () => {
            mapRef.current.remove();
        };
    }, []);

    return <div ref={mapContainerRef} className="map-container"></div>;
};

export default CreateMap;
