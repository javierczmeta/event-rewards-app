import "../styles/FeedSearch.css";
import { Search, SlidersHorizontal, Funnel } from "lucide-react";

const FeedSearch = () => {
    return (
        <div className="feed-options-container">
            <div className="feed-tool-container">
                Search Bar{" "}
                <Search className="feed-search-icon" strokeWidth={3} size={25} color="white"/>
            </div>
            <div className="feed-tool-container"><SlidersHorizontal size={20}/> Filters</div>
            <div className="feed-tool-container"><Funnel size={20}/> Sort</div>
        </div>
    );
};

export default FeedSearch;
