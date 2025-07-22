import { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import polyline from "@mapbox/polyline";
import "../styles/ItineraryMap.css";

const ItineraryMap = ({ route }) => {
    const decodedCoords = polyline.decode(route.geometry);
    const coordinates = decodedCoords.map(([lat, lng]) => [lng, lat]);
    const lats = coordinates.map((coord) => coord[1]);
    const lngs = coordinates.map((coord) => coord[0]);
    const bounds = [
        [Math.min(...lngs), Math.min(...lats)], // southwest corner
        [Math.max(...lngs), Math.max(...lats)], // northeast corner
    ];
    const routeGeoJson = {
        type: "Feature",
        geometry: {
            type: "LineString",
            coordinates: coordinates,
        },
    };

    const mapRef = useRef();
    const mapContainerRef = useRef();
    const mapboxToken = import.meta.env.VITE_GEOCODING_TOKEN;
    useEffect(() => {
        mapboxgl.accessToken = mapboxToken;
        mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            center: coordinates[0],
            zoom: 12,
        });

        mapRef.current.on("load", () => {
            mapRef.current.scrollZoom.disable();
            mapRef.current.boxZoom.disable();
            mapRef.current.dragRotate.disable();
            mapRef.current.dragPan.disable();
            mapRef.current.keyboard.disable();
            mapRef.current.doubleClickZoom.disable();
            mapRef.current.touchZoomRotate.disable();
            // Add the route as a source
            mapRef.current.addSource("route", {
                type: "geojson",
                data: routeGeoJson,
            });
            // Add a line layer to display the route
            mapRef.current.addLayer({
                id: "route",
                type: "line",
                source: "route",
                layout: {
                    "line-join": "round",
                    "line-cap": "round",
                },
                paint: {
                    "line-color": "#007bff",
                    "line-width": 5,
                },
            });

            new mapboxgl.Marker({ color: "red" })
                .setLngLat(coordinates[0])
                .addTo(mapRef.current);

            new mapboxgl.Marker({ color: "green" })
                .setLngLat(coordinates[coordinates.length - 1])
                .addTo(mapRef.current);

            mapRef.current.fitBounds(bounds, {
                padding: 40,
                maxZoom: 15,
                duration: 1000, // animation duration in ms
            });
        });

        return () => {
            mapRef.current.remove();
        };
    }, []);

    return (
        <div>
            <div ref={mapContainerRef} className="itinerary-map"></div>
        </div>
    );
};

export default ItineraryMap;
