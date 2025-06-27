import "../styles/FeedSearch.css";
import {SlidersHorizontal, Funnel } from "lucide-react";
import SearchBar from "./SearchBar";

const FeedSearch = ({searchFieldProps}) => {
    return (
        <div className="feed-options-container">
            <SearchBar searchFieldProps={searchFieldProps}/>
            <div className="feed-tool-container"><SlidersHorizontal size={20}/> Filters</div>
            <div className="feed-tool-container"><Funnel size={20}/> Sort</div>
        </div>
    );
};

export default FeedSearch;
