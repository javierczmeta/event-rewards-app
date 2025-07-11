import UserImage from "./UserImage";
import "../styles/UserBadge.css";
import { useState } from "react";
import Badge from "./Badge";

const UserBadge = ({ profile, mousePosition, badgeClass}) => {
    const [hovered, setHovered] = useState(false);

    return (
        <>
            <div
                onMouseEnter={() => {
                    setHovered(true);
                }}
                onMouseLeave={() => {
                    setHovered(false);
                }}
                className="badge-container"
            >
                <UserImage className="user-badge-image" image={profile.image} />
            </div>
            {hovered ? (
                <div className="hover-user" style={{top: mousePosition.y - 330, left: mousePosition.x}}>
                    <UserImage className="hover-user-image" image={profile.image} />
                    <h4>{profile.display_name}</h4>
                    <p>{profile.points} points</p>
                    <div>
                        {profile.display_badges.map(badge => {return <Badge key={badge.id} badge={badge} className={badgeClass}/>})}
                    </div>
                </div>) : <></>
            }
        </>
    );
};

export default UserBadge;
