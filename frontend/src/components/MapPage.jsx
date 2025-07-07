import GeneralMap from "./GeneralMap";
import "../styles/MapPage.css"
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

const MapPage = () => {
    const getEventsInMapMutation = useMutation({
        mutationFn: (bounds) => {
            const url = import.meta.env.VITE_SERVER_API;
            return axios.get(
                `${url}/events/within-bounds?swLng=${bounds[0]}&swLat=${bounds[1]}&neLng=${bounds[2]}&neLat=${bounds[3]}`
            );
        },
        onSuccess: (d) => {
            console.log(d)
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

    return (<main className="map-main">
        <div></div>
        <GeneralMap className="page-map" fetchEvents={getEventsInMapMutation.mutate}/>
    </main>)
}

export default MapPage;