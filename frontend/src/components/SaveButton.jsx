import { Bookmark } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import "../styles/SaveButton.css"


const SaveButton = ({saved, eventId}) => {
    if (saved === undefined) {
        return <></>
    }

    const queryClient = useQueryClient()

    const saveMutation = useMutation({
        mutationFn: () => {
            const url = import.meta.env.VITE_SERVER_API;
            return axios.patch(`${url}/events/saved/${eventId}`, {}, {
                withCredentials: true,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries("events", "organized-events");
        },
    });

    const handleSaveClick = (e) => {
        e.stopPropagation()
        saveMutation.mutate()
    }

    return <div className="save-button" onClick={handleSaveClick}>
    {saved ? <Bookmark size={40} fill="gold" stroke="brown"/> : <Bookmark size={40} fill="white" stroke="black"/>}
    </div>
}

export default SaveButton;