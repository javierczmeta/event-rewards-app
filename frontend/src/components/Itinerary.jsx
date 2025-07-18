import Timeline from 'react-timelines'
import Event from './Event';
import { createDateWithOffset } from '../utils/createDateWithOffset';

const Itinerary = ({ setShowItinerary, events, selectedEventIds, commutes }) => {

    return (
        <div
            className="modal-overlay"
            onClick={() => {
                setShowItinerary(false);
            }}
        >
            <aside
                className="schedule-modal"
                onClick={(e) => {
                    e.stopPropagation();
                }}
            >
                {selectedEventIds.map((id, index) => {
                    const event = events.find(x => x.id === id);
                    const startTime = createDateWithOffset(event.start_time)
                    const endTime = createDateWithOffset(event.end_time)
                    return (
                    <> 
                        <p>➡️ Go to <span className='bold'>{event.name}</span> from {startTime.toLocaleTimeString()} to {endTime.toLocaleTimeString()}</p>
                        <Event key={id} event={event}/>
                        {commutes && index < selectedEventIds.length - 1 && <p>🚗 Drive for <span className='bold'>{Math.round(commutes[index])} minute(s)</span> to the next event.</p>}
                    </>
                    )
                })}
            </aside>
        </div>
    );
};

export default Itinerary;
