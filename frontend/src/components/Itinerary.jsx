import Event from './Event';
import { createDateWithOffset } from '../utils/createDateWithOffset';
import ItineraryMap from './ItineraryMap';

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
                        <p key={id + "p"}>➡️ Go to <span className='bold'>{event.name}</span> from {startTime.toLocaleTimeString()} to {endTime.toLocaleTimeString()}</p>
                        <Event key={id + "e"} event={event} navigatePage={"/schedule"}/>
                        {commutes && index < selectedEventIds.length - 1 && 
                            <>
                                <p key={id + "p2"}>
                                    🚗 Drive for <span className='bold'>{Math.round(commutes[index][0].time)} minute(s)
                                        </span> to the next event. ({Math.floor(commutes[index][1]/ 60)}h {Math.round(commutes[index][1] % 60)}m time window)
                                </p>
                                <ItineraryMap key={id + "m"} route={commutes[index][0].route}/>
                            </>
                        }
                    </>
                    )
                })}
            </aside>
        </div>
    );
};

export default Itinerary;
