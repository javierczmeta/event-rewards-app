import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import LoadingGif from "./LoadingGif";
import { useEffect } from "react";
import { useUser } from "../contexts/UserContext";
import Rating from "react-rating";
import { Star } from "lucide-react";
import "../styles/ReviewPage.css";
import { ToastContainer, toast, Slide } from "react-toastify";
import EventImage from "./EventImage";
import { useFormInput } from "../utils/useFormInput";
import { useState } from "react";

const ReviewPage = () => {
    const { eventID } = useParams();
    const { user } = useUser();
    const navigate = useNavigate();

    const getEvent = useQuery({
        queryKey: ["event", eventID],
        queryFn: () => {
            const url = import.meta.env.VITE_SERVER_API;
            return axios.get(`${url}/events/${eventID}`, {
                withCredentials: true,
            });
        },
        refetchOnWindowFocus: false,
    });

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
        retry: false,
    });

    const reviewMutation = useMutation({
        mutationFn: (reviewObj) => {
            const url = import.meta.env.VITE_SERVER_API;
            return axios.post(`${url}/events/${eventID}/reviews`, reviewObj, {
                withCredentials: true,
            });
        },
        onSuccess: () => {
            toast.success("Success");
            navigate(`/users/${user.id}`);
        },
        onError: (e) => {
            if (e.response) {
                toast.error(e.response.data.message);
            } else {
                toast.error("Unknown Error... Try again later");
            }
        },
    });

    const reviewTextProps = useFormInput("")[0];
    const [rating, setRating] = useState(0);

    useEffect(() => {
        const hasNotGoneToEvent =
            getRSVP.isSuccess && !getRSVP.data.data.check_in_time;

        if (getRSVP.isError || hasNotGoneToEvent) {
            navigate(`/users/${user.id}`);
        }
    }, [getRSVP.data, getRSVP.status]);

    if (getEvent.isPending) {
        return (
            <main>
                <LoadingGif />
            </main>
        );
    }

    return (
        <main className="review-main">
            <div className="review-container">
                <h2>How was {getEvent.data.data.name} ?</h2>
                <EventImage
                    image={getEvent.data.data.image}
                    className="review-image"
                />
                <Rating
                    start={0}
                    stop={5}
                    emptySymbol={
                        <Star size={40} fill={"lightgray"} stroke={"grey"} />
                    }
                    fullSymbol={<Star size={40} fill="gold" />}
                    onChange={(rating) => {
                        setRating(rating);
                    }}
                />
                <textarea {...reviewTextProps} />
                <button
                    className="review-button"
                    onClick={() => {
                        reviewMutation.mutate({
                            rating: rating,
                            review: reviewTextProps.value,
                        });
                    }}
                >
                    Save
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
        </main>
    );
};

export default ReviewPage;
