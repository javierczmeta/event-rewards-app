import { useNavigate } from "react-router";
import { GalleryVerticalEnd } from "lucide-react";

const MapTools = () => {
    const navigate = useNavigate();
    return (
        <div className="feed-options-container">
            <div
                className="feed-tool-container"
                onClick={() => {
                    navigate("/feed");
                }}
            >
                <GalleryVerticalEnd /> <p>Feed View</p>
            </div>
        </div>
    );
};

export default MapTools;
