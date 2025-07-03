import "../styles/EventFeed.css";
import Event from "./Event";
import { useQuery } from "@tanstack/react-query";
import axios from 'axios'

const EventFeed = ({searchFieldProps}) => {

    const getEvents = useQuery({
        queryKey: ['events', searchFieldProps.value],
        queryFn: () => {
            const url = import.meta.env.VITE_SERVER_API;
            return axios.get(`${url}/events?search=${searchFieldProps.value}`, {
                withCredentials: true,
            });
        },
        refetchOnWindowFocus: false,
        refetchInterval: 1000 * 60 * 5
    });

    return (
        <main className="feed-main">
            <div className="events-container">
                {getEvents.isPending && <div><p>Loading...</p></div>}
                {getEvents.isError && <div>{getEvents.error}</div>}
                {getEvents.isSuccess && getEvents.data.data.map(event => <Event key={event.id} event={event}/>)}
                {getEvents.isSuccess && getEvents.data.data.length === 0 && <h3>No Events to show...</h3>}
            </div>
        </main>
    );
};

export default EventFeed;
