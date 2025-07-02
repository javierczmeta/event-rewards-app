import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const CreateMap = ({longitudeProps, latitudeProps}) => {
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

        const marker = new mapboxgl.Marker()
            .setLngLat([longitudeProps.value, latitudeProps.value])
            .addTo(mapRef.current);

        mapRef.current.on("click", (e) => {
            longitudeProps.setValue(e.lngLat.lng)
            latitudeProps.setValue(e.lngLat.lat)
            marker.setLngLat([e.lngLat.lng, e.lngLat.lat]);
        });

        return () => {
            mapRef.current.remove();
        };
    }, []);

    return <div ref={mapContainerRef} className="map-container"></div>;
};

export default CreateMap;
