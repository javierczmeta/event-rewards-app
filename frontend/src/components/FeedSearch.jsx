import "../styles/FeedSearch.css";
import { SlidersHorizontal } from "lucide-react";
import SearchBar from "./SearchBar";
import Sorter from "./Sorter";

const FeedSearch = ({ searchFieldProps, sortState, setSortState }) => {
    return (
        <div className="feed-options-container">
            <SearchBar searchFieldProps={searchFieldProps} />
            <div className="feed-tool-container">
                <SlidersHorizontal size={20} /> Filters
            </div>
            <Sorter sortState={sortState} setSortState={setSortState}/>
        </div>
    );
};

export default FeedSearch;
