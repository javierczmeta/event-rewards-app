import { useParams, useNavigate } from "react-router";
import "../styles/EventModal.css";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import SingleEventInfo from "./SingleEventInfo";
import LoadingGif from "./LoadingGif";

const EventModal = ({returnPage}) => {
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

    if (getEvent.isPending) {
        return (
            <div className="modal-overlay">
            <aside className="modal-content">
                <LoadingGif/>
            </aside>
        </div>
        )
    }

    if (getEvent.isError) {
        navigate(returnPage)
        return
    }


    return (
        <div className="modal-overlay" onClick={()=>{navigate(returnPage)}}>
            <SingleEventInfo chosenEvent={getEvent.data.data}/>
        </div>
    );
};

export default EventModal;
