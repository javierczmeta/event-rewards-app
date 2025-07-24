import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const CreateMap = ({formInputs}) => {
    const mapContainerRef = useRef();
    const mapRef = useRef();

    const [setLongitude, setLatitude] = [formInputs.longitudeProps[1].setValue, formInputs.latitudeProps[1].setValue]

    const mapboxToken = import.meta.env.VITE_GEOCODING_TOKEN;
    useEffect(() => {
        mapboxgl.accessToken = mapboxToken;
        mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            center: [formInputs.longitudeProps[0].value, formInputs.latitudeProps[0].value], // starting position [lng, lat]
            zoom: 15, // starting zoom
        });

        const marker = new mapboxgl.Marker()
            .setLngLat([formInputs.longitudeProps[0].value, formInputs.latitudeProps[0].value])
            .addTo(mapRef.current);

        mapRef.current.on("click", (e) => {
            setLongitude(e.lngLat.lng)
            setLatitude(e.lngLat.lat)
            marker.setLngLat([e.lngLat.lng, e.lngLat.lat]);
        });

        return () => {
            mapRef.current.remove();
        };
    }, []);

    return <div ref={mapContainerRef} className="map-container"></div>;
};

export default CreateMap;
