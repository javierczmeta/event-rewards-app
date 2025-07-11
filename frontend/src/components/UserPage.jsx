import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import LoadingGif from "./LoadingGif";
import UserImage from "./UserImage";
import "../styles/UserPage.css";
import Badge from "./Badge";

const UserPage = () => {
    const { userId } = useParams();

    const getUser = useQuery({
        queryKey: ["user", userId],
        queryFn: () => {
            const url = import.meta.env.VITE_SERVER_API;
            return axios.get(`${url}/users/${userId}`);
        },
        refetchOnWindowFocus: false,
    });

    if (getUser.isPending) {
        return (
            <main className="modal-content">
                <LoadingGif />
            </main>
        );
    }

    if (getUser.isError) {
        <main className="modal-content">
            <h2>User Not Found</h2>
        </main>;
        return;
    }

    return (
        <main className="user-main">
            <div className="profile-info-container">
                <div className="user-page-info-main">
                    <UserImage
                        image={getUser.data.data.profile.image}
                        className="user-page-image"
                    />
                    <div className="user-page-info">
                        <h2>{getUser.data.data.profile.display_name}</h2>
                        <p>{getUser.data.data.profile.points} points</p>
                        <h4>Badges:</h4>
                        <div>
                            {getUser.data.data.profile.display_badges.length ? (
                                getUser.data.data.profile.display_badges.map(
                                    (badge) => {
                                        console.log(badge)
                                        return <Badge key={badge.id} badge={badge} className='user-page-badge'/>;
                                    }
                                )
                            ) : (
                                <p>No badges displayed...</p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="milestone-container">
                    <h3>Next Milestone</h3>
                    <div className="bar"></div>
                </div>
                <div className="user-history-feed"></div>
            </div>
        </main>
    );
};

export default UserPage;
