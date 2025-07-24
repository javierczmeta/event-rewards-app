import Event from "./Event";
import "../styles/HistoryEvent.css";
import { createDateWithOffset } from "../utils/createDateWithOffset";
import { useUser } from "../contexts/UserContext";

const HistoryEvent = ({ name, rsvp }) => {
    const {user} = useUser()
    const timestamp = createDateWithOffset(rsvp.updated_at);

    return (
        <div className="event-history-container">
            <p className="timestamp">{timestamp.toUTCString()}</p>
            <p className="event-history-info">
                {rsvp.check_in_time
                    ? `${name} just went to ${rsvp.event.name}!`
                    : `${name}'s status is "${rsvp.status}" for ${rsvp.event.name}.`}
            </p>
            <div className="user-page-event-container">
                <Event event={rsvp.event} navigatePage={`/users/${user.id}`}/>
            </div>
        </div>
    );
};

export default HistoryEvent;
