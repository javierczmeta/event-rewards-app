import UserImage from "./UserImage";
import "../styles/UserBadge.css";
import { useState } from "react";
import Badge from "./Badge";
import { useNavigate } from "react-router";
import { orderLike } from "../utils/sortObjectsWithList";

const UserBadge = ({ profile, mousePosition, badgeClass, checkedIn}) => {
    const [hovered, setHovered] = useState(false);
    const navigate = useNavigate();

    console.log(checkedIn)
    const containerClass = "badge-container" + (checkedIn ? " checked" : "")
    return (
        <>
            <div
                onMouseEnter={() => {
                    setHovered(true);
                }}
                onMouseLeave={() => {
                    setHovered(false);
                }}
                className={containerClass}
                onClick={() => {navigate(`/users/${profile.user_id}`)}}
            >
                <UserImage className="user-badge-image" image={profile.image} />
            </div>
            {hovered ? (
                <div className="hover-user" style={{top: mousePosition.y - 330, left: mousePosition.x}}>
                    <UserImage className="hover-user-image" image={profile.image} />
                    <h4>{profile.display_name}</h4>
                    <p>{profile.points} points</p>
                    <div className="user-mini-badges">
                        {orderLike(profile.display_badges, profile.badge_order).map(badge => {return <Badge key={badge.id} badge={badge} className={badgeClass} onlyIcons={true}/>})}
                    </div>
                </div>) : <></>
            }
        </>
    );
};

export default UserBadge;
