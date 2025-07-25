import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import LoadingGif from "./LoadingGif";
import Review from "./Review";
import "../styles/Reviews.css"


const Reviews = ({eventId}) => {
    const getReviews = useQuery({
        queryKey: ["reviews", eventId],
        queryFn: () => {
            const url = import.meta.env.VITE_SERVER_API;
            return axios.get(`${url}/events/${eventId}/reviews/`);
        }
    })

    if (getReviews.isPending) {
        return <LoadingGif/>
    }

    if (getReviews.Error) {
        return <div>Error fetching reviews...</div>
    }

    return <div className="span-grid">
        <p><span>Reviews:</span></p>
        <div className="review-list-container">
            {getReviews.data.data.length === 0 && <p>No reviews to show</p>}
            {getReviews.data.data.map(review => <Review key={review.id} review={review}/>)}
        </div>

    </div>
}

export default Reviews;