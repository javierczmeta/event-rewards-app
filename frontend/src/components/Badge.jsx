import "../styles/Badge.css";
import { DynamicIcon } from "lucide-react/dynamic";
import { useState } from "react";

const Badge = ({ badge, className, onClick, onlyIcons, mousePosition }) => {
    const [hovered, setHovered] = useState(false);

    onlyIcons = onlyIcons === true;
    className = `${className} ${badge.color}`;

    return (
        <>
            <div
                className={className}
                onClick={onClick}
                onMouseEnter={() => {
                    setHovered(true);
                }}
                onMouseLeave={() => {
                    setHovered(false);
                }}
            >
                <DynamicIcon name={badge.icon} className="badge-icon" />
                {!onlyIcons && <p className="badge-info">{badge.name}</p>}
            </div>

            {mousePosition && hovered && (
                <div
                    className={`hover-badge ${badge.color}`}
                    style={{
                        top: mousePosition.y,
                        left: mousePosition.x,
                    }}
                >
                    <DynamicIcon name={badge.icon} className="badge-icon" size={40}/>
                    <h4>{badge.name}</h4>
                    <p>{badge.description}</p>

                </div>
            )}
        </>
    );
};

export default Badge;
