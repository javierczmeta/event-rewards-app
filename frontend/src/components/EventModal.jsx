import { useParams, useNavigate } from "react-router";
import "../styles/EventModal.css";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import SingleEventInfo from "./SingleEventInfo";

const EventModal = () => {
    const {eventID} = useParams()
    const navigate = useNavigate()

    const getEvent = useQuery({
        queryKey: ['event', eventID],
        queryFn: () => {
            const url = import.meta.env.VITE_SERVER_API;
            return axios.get(`${url}/events/${eventID}`, {
                withCredentials: true,
            });
        },
        refetchOnWindowFocus: false,
    });

    if (getEvent.isError) {
        console.log(getEvent.error)
        navigate('/feed')
        return
    }

    if (getEvent.isPending) {
        return (
            <div className="modal-overlay">
            <aside className="modal-content">
                <h4>Loading...</h4>
            </aside>
        </div>
        )
    }


    return (
        <div className="modal-overlay" onClick={()=>{navigate('/feed')}}>
            <SingleEventInfo chosenEvent={getEvent.data.data}/>
        </div>
    );
};

export default EventModal;
