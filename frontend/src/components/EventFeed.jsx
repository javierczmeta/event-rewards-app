import "../styles/EventFeed.css";
import Event from "./Event";

const EventFeed = () => {
    const exampleEvent = {
        id: 1,
        name: "The First Event",
        latitude: 37.453,
        longitude: 122.1817,
        image: null,
        start_time: "2025-06-27T18:00:00.000Z",
        end_time: "2025-06-28T00:00:00.000Z",
        created_at: "2025-06-27T00:00:00.000Z",
        price: "Free",
        rewards: 1000,
        image: "https://media.istockphoto.com/id/610560418/photo/facebook-menlo-park-campus-headquarters.jpg?s=612x612&w=0&k=20&c=Dqq5Dk8w4Gw1YUq5zKm0aeutMiP6A6tSPSeF1u4GCAA=",
        description:
            "The first event in the famous menlo park. Come celebrate the first week of my project",
        tags: ["Celebration", "Javier", "Joy"],
        organizer_id: 5,
    };

    return (
        <main className="feed-main">
            <div className="events-container">
                <Event event={exampleEvent} />
            </div>
        </main>
    );
};

export default EventFeed;
