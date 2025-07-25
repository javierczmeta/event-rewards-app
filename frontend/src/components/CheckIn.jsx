import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useParams } from "react-router";
import { toast } from "react-toastify";
import { useFormInput } from "../utils/useFormInput";
import "../styles/CheckIn.css"
import { useUser } from "../contexts/UserContext";

const CheckIn = () => {
    const codeProps = useFormInput("")[0];
    const {user} = useUser()
    const queryClient = useQueryClient();

    const { eventID } = useParams();
    const checkInMutation = useMutation({
        mutationFn: (code) => {
            const url = import.meta.env.VITE_SERVER_API;
            return axios.patch(
                `${url}/events/${eventID}/checkin/${user.id}/${code}`,
                {},
                {
                    withCredentials: true,
                }
            );
        },
        onSuccess: () => {
            toast.success("Success");
            queryClient.refetchQueries(["attendees", eventID])
            queryClient.refetchQueries(["user", user.id])
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
        <form className="checkin-form"
            onSubmit={(e) => {
                e.preventDefault();
                checkInMutation.mutate(codeProps.value);
            }}
        >
            <input
                type="number"
                placeholder="Ask the Organizer for the check-in code!"
                className="code-input"
                {...codeProps}
                required
            />
            <button type="submit">Submit</button>
        </form>
    );
};

export default CheckIn;
