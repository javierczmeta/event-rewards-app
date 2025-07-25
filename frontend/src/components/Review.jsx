import Rating from "react-rating";
import { useNavigate } from "react-router";
import UserImage from "./UserImage";
import { Star } from "lucide-react";

const Review = ({ review }) => {
    const navigate = useNavigate()
    return (
        <div className="single-review-container">
            <div className="review-user-info">
                <UserImage className="review-user-image" image={review.author.profile.image} onClick={() => {navigate(`/users/${review.author.profile.user_id}`)}}/>
                <p>{review.author.profile.display_name}</p>
            </div>
            
            <div>
                <Rating
                    readonly={true}
                    initialRating={review.rating}
                    start={0}
                    stop={5}
                    emptySymbol={
                        <Star size={20} fill={"lightgray"} stroke={"grey"} />
                    }
                    fullSymbol={<Star size={20} fill="gold" />}
                />
                <p>{review.review}</p>
            </div>
        </div>
    );
};

export default Review;
