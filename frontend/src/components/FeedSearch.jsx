import "../styles/FeedSearch.css";
import { Map } from "lucide-react";
import SearchBar from "./SearchBar";
import Sorter from "./Sorter";
import { useNavigate } from "react-router";

const FeedSearch = ({ searchFieldProps, sortState, setSortState }) => {
    const navigate = useNavigate();

    return (
        <div className="feed-options-container">
            <SearchBar searchFieldProps={searchFieldProps} />
            <div className="feed-tool-container" onClick={() => {navigate("/map")}}>
                <Map size={20} /> Map View
            </div>
            <Sorter sortState={sortState} setSortState={setSortState}/>
        </div>
    );
};

export default FeedSearch;
