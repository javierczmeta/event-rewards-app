import Badge from "./Badge";
import "../styles/BadgeSelector.css";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import LoadingGif from "./LoadingGif";


const BadgeSelector = ({ badges, setIsEditing, display_badges }) => {
    const queryClient = useQueryClient();

    const [shown, setShown] = useState(display_badges);

    const toggleBadge = (badge) => {
        const isShown = shown.some((x) => x.id === badge.id);
        // Add badge to list
        if (!isShown && shown.length < 3) {
            setShown((prev) => prev.concat(badge));
        }
        // Remove badge from display list
        if (isShown) {
            setShown((prev) => prev.filter((x) => x.id !== badge.id));
        }
    };

    const badgeMutation = useMutation({
        mutationFn: (displayBadges) => {
            const url = import.meta.env.VITE_SERVER_API;
            return axios.patch(`${url}/badges`, {badges: displayBadges}, {
                withCredentials: true,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries("user");
            setIsEditing(false);
        },
    });

    return (
        <>
            <div
                className="modal-overlay"
                onClick={() => {
                    setIsEditing(false);
                }}
            >
                <aside
                    className="badge-modal"
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                >
                    <div>
                        <h3>All Badges</h3>
                        <div className="badge-select-container">
                            {badges.map((badge) => {
                                return (
                                    <Badge
                                        badge={badge}
                                        className="user-page-badge"
                                        key={badge.id}
                                        onClick={() => {
                                            toggleBadge(badge);
                                        }}
                                    />
                                );
                            })}
                        </div>
                    </div>
                    <div>
                        <h3>Shown Badges ({shown.length}/3)</h3>
                        <div className="badge-select-container">
                            {shown.map((badge) => {
                                return (
                                    <Badge
                                        badge={badge}
                                        className="user-page-badge"
                                        key={badge.id}
                                        onClick={() => {toggleBadge(badge)}}
                                    />
                                );
                            })}
                        </div>
                    </div>
                    {badgeMutation.isPending ? (
                        <LoadingGif/>
                    ) : (
                        <button
                        className="edit-badge-button"
                        onClick={() =>
                            badgeMutation.mutate(shown.map((badge) => badge.id))
                        }
                    >
                        Save
                    </button>
                    )}
                    
                </aside>
            </div>
        </>
    );
};

export default BadgeSelector;
