import "../styles/RSVP.css";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useUser } from "../contexts/UserContext";
import { useParams } from "react-router";

const RSVP = () => {
    const {user} = useUser();

    return (
        <div className="rsvp-container">
            <button>Going!</button>
            <button>Maybe</button>
            <button>Not Going</button>
        </div>
    );
};

export default RSVP;
