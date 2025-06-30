import "../styles/EventModal.css";
import { createDateWithOffset } from "../utils/createDateWithOffset";
import { useReverseGeocoding } from "../utils/useReverseGeocoding";

const EventModal = ({ ref, chosenEvent }) => {
    const startDate = createDateWithOffset(chosenEvent.start_time);
    const endDate = createDateWithOffset(chosenEvent.end_time);

    const getEventLocation = useReverseGeocoding(
        chosenEvent.id,
        chosenEvent.longitude,
        chosenEvent.latitude
    );

    return (
        <div className="modal-overlay">
            <aside className="modal-content" ref={ref}>
                <img
                    src={chosenEvent.image}
                    alt={"Image for " + chosenEvent.name}
                    className="modal-image"
                ></img>
                <div className="modal-event-info">
                    <h2 className="modal-event-title">{chosenEvent.name}</h2>
                    <div className="time-info">
                        <p className="span-grid">
                            <span>When?</span> {startDate.toLocaleDateString()}
                        </p>
                        <p>Starts at {startDate.toLocaleTimeString()}</p>
                        <p>Ends at {endDate.toLocaleTimeString()}</p>
                    </div>
                    {getEventLocation.isSuccess && (
                        <p>
                            <span>Where? </span>
                            {
                                getEventLocation.data.data.features[0]
                                    .properties.full_address
                            }
                        </p>
                    )}
                    <p>
                        <span>Price:</span> {chosenEvent.price}
                    </p>
                    <p>
                        <span>Points:</span> {chosenEvent.rewards} points
                    </p>
                    <div className="tag-container">
                        {chosenEvent.tags
                            ? chosenEvent.tags.map((tag, index) => (
                                  <div key={index} className="tag">
                                      {tag}
                                  </div>
                              ))
                            : "No tags"}
                    </div>
                    <p>
                        <span>Organizer: </span>
                    </p>
                    <div className="organizer-section">
                        <div className="organizer-image">
                            {chosenEvent.organizer.profile.image ? (
                                <img
                                    src={chosenEvent.organizer.profile.image}
                                ></img>
                            ) : (
                                <></>
                            )}
                        </div>
                        <p className="organizer-name">{chosenEvent.organizer.profile.display_name}</p>
                    </div>
                </div>
                <p className="span-grid">
                    Description: {chosenEvent.description}
                </p>
                <p className="span-grid">
                    <span>People Going: </span>
                </p>
                <p className="span-grid">
                    <span>Your status:</span>
                </p>
            </aside>
        </div>
    );
};

export default EventModal;
