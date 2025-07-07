import UserImage from "./UserImage";
import "../styles/UserBadge.css"

const UserBadge = ({ profile }) => {
    return <div>
        <UserImage className="user-badge-image" image={profile.image}/>
    </div>;
};

export default UserBadge;
