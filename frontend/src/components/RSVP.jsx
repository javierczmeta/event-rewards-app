import "../styles/RSVP.css";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useUser } from "../contexts/UserContext";
import { useParams } from "react-router";
import { ToastContainer, toast, Slide } from "react-toastify";


const RSVP = () => {
    const { user } = useUser();
    const { eventID } = useParams();
    const queryClient = useQueryClient()

    const getRSVP = useQuery({
        queryKey: ["rsvp", user.id, eventID],
        queryFn: () => {
            const url = import.meta.env.VITE_SERVER_API;
            return axios.get(`${url}/events/${eventID}/rsvp`, {
                withCredentials: true,
            });
        },
        refetchOnWindowFocus: false,
        refetchInterval: 1000 * 60 * 5,
        staleTime: 0,
    });

    const setRSVPMutation = useMutation({
        mutationFn: (status) => {
            const url = import.meta.env.VITE_SERVER_API;
                return axios.post(`${url}/events/${eventID}/rsvp`, {status} , {
                withCredentials: true,
            });
        },
        onSuccess: () => {
            toast.success("Success");
            queryClient.invalidateQueries("rsvp");
        },
        onError: (e) => {
            console.log(e);
            if (e.response) {
                toast.error(e.response.data.message);
            } else {
                toast.error("Unknown Error... Try again later");
            }
        },
    })

    if (getRSVP.isPending) {
        return <p>Loading...</p>;
    }

    if (getRSVP.isError) {
        return <p>Error...</p>;
    }

    let rsvpState = getRSVP.data.data;
    if (rsvpState != []) {
        rsvpState = rsvpState.status
    }

    return (
        <>
            <div className="rsvp-container">
                <button
                    className={rsvpState === "Going" ? "active" : ""}
                    onClick={() => {
                        setRSVPMutation.mutate("Going");
                    }}
                >
                    Going!
                </button>
                <button
                    className={rsvpState === "Maybe" ? "active" : ""}
                    onClick={() => {
                        setRSVPMutation.mutate("Maybe");
                    }}
                >
                    Maybe
                </button>
                <button
                    className={rsvpState === "Not Going" ? "active" : ""}
                    onClick={() => {
                        setRSVPMutation.mutate("Not Going");
                    }}
                >
                    Not Going...
                </button>
            </div>
            <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick={false}
                    rtl={false}
                    pauseOnFocusLoss={false}
                    draggable={false}
                    pauseOnHover
                    theme="light"
                    transition={Slide}
                />
        </>
    );
};

export default RSVP;
