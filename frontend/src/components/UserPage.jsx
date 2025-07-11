import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import LoadingGif from "./LoadingGif";
import UserImage from "./UserImage";
import "../styles/UserPage.css";
import Badge from "./Badge";
import { useMemo } from "react";
import HistoryEvent from "./HistoryEvent";

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

    const rsvps = useMemo(() => { if (getUser.isSuccess) {return getUser.data.data.rsvps} else {return []}}, [getUser.data])

    if (getUser.isPending) {
        return (
            <main className="modal-content">
                <LoadingGif />
            </main>
        );
    }

    if (getUser.isError) {
        console.log(getUser.error)
        return (<main className="user-error-main">
            <h2>Error: {getUser.error.message}</h2>
            <p>{getUser.error.response.data.message}</p>
        </main>)
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
                <div className="user-history-feed">
                    {rsvps.map(rsvp => {
                        return <HistoryEvent key={rsvp.id} name={getUser.data.data.profile.display_name} rsvp={rsvp}/>
                    })}
                </div>
            </div>
        </main>
    );
};

export default UserPage;
