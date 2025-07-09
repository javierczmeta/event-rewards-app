import "../styles/EventDeleteButton.css";
import { Trash } from "lucide-react";
import { useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ToastContainer, toast, Slide } from "react-toastify";

const EventDeleteButton = ({ eventId }) => {
    const navigate = useNavigate();

    const queryClient = useQueryClient();

    const deleteEventMutation = useMutation({
        mutationFn: (eventId) => {
            const url = import.meta.env.VITE_SERVER_API;
            return axios.delete(`${url}/events/${eventId}`, {
                withCredentials: true,
            });
        },
        onSuccess: () => {
            console.log("Success");
            queryClient.invalidateQueries("events");
            navigate("/feed");
        },
        onError: () => {
            toast.error("Unknown Error... Try again later");
        },
    });

    return (
        <>
            <button
                className="delete-button"
                onClick={() => {
                    if (confirm("Are you sure?")){deleteEventMutation.mutate(eventId);}
                }}
            >
                <Trash color="white" strokeWidth={2} size={32} />
            </button>
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

export default EventDeleteButton;
