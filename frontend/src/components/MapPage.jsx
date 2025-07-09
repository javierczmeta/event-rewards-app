import GeneralMap from "./GeneralMap";
import "../styles/MapPage.css";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useState, useRef } from "react";
import MapEventCard from "./MapEventCard";

const MapPage = () => {
    const [mapEvents, setMapEvents] = useState([]);
    const mapRef = useRef();

    const getEventsInMapMutation = useMutation({
        mutationFn: (bounds) => {
            const url = import.meta.env.VITE_SERVER_API;
            return axios.get(
                `${url}/events/within-bounds?swLng=${bounds[0]}&swLat=${bounds[1]}&neLng=${bounds[2]}&neLat=${bounds[3]}`
            );
        },
        onSuccess: (data) => {
            setMapEvents(data.data);
        },
        onError: (e) => {
            console.log(e);
            if (e.response) {
                toast.error(e.response.data.message);
            } else {
                toast.error("Unknown Error... Try again later");
            }
        },
    });

    return (
        <main className="map-main">
            <div className="map-events-container">
                {getEventsInMapMutation.isPending ? <h2>Loading...</h2> : mapEvents.map((event) => (
                    <MapEventCard key={event.id} event={event} mapRef={mapRef}/>))}
            </div>
            <GeneralMap
                className="page-map"
                fetchEvents={getEventsInMapMutation.mutate}
                mapEvents={mapEvents}
                mapRef={mapRef}
            />
        </main>
    );
};

export default MapPage;
