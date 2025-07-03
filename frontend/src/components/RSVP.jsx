import "../styles/RSVP.css";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useUser } from "../contexts/UserContext";
import { useParams } from "react-router";
import { useState } from "react";

const RSVP = () => {
    const { user } = useUser();

    const [rsvpState, setRsvpState] = useState(null);

    return (
        <div className="rsvp-container">
            <button
                className={rsvpState === "Going" ? "active" : ""}
                onClick={() => {
                    setRsvpState("Going");
                }}
            >
                Going!
            </button>
            <button
                className={rsvpState === "Maybe" ? "active" : ""}
                onClick={() => {
                    setRsvpState("Maybe");
                }}
            >
                Maybe
            </button>
            <button
                className={rsvpState === "Not Going" ? "active" : ""}
                onClick={() => {
                    setRsvpState("Not Going");
                }}
            >
                Not Going...
            </button>
        </div>
    );
};

export default RSVP;
