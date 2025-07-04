import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useParams } from "react-router";
import { ToastContainer, toast, Slide } from "react-toastify";
import { useFormInput } from "../utils/useFormInput";

const CheckIn = () => {
    const userProps = useFormInput("");
    const { eventID } = useParams();
    const setCheckInMutation = useMutation({
        mutationFn: (userID) => {
            const url = import.meta.env.VITE_SERVER_API;
            return axios.patch(
                `${url}/events/${eventID}/checkin/${userID}`,
                {},
                {
                    withCredentials: true,
                }
            );
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
    });

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                setCheckInMutation.mutate(userProps.value);
            }}
        >
            <input
                type="number"
                placeholder="userID to check in"
                {...userProps}
                required
            />
            <button type="submit">Submit</button>
        </form>
    );
};

export default CheckIn;
