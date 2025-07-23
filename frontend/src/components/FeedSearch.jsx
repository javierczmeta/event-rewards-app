import "../styles/FeedSearch.css";
import { Map, Star } from "lucide-react";
import SearchBar from "./SearchBar";
import Sorter from "./Sorter";
import { useNavigate } from "react-router";
import Filters from "./Filters";

const FeedSearch = ({ searchFieldProps, sortState, setSortState, setIsRecommending, isRecommending, checkboxData, setCheckboxData, filterOptions}) => {
    const navigate = useNavigate();

    const recommenderClass = isRecommending ? "feed-tool-container active" : "feed-tool-container"

    return (
        <div className="feed-options-container">
            <SearchBar searchFieldProps={searchFieldProps} />
            <div className="feed-tool-container" onClick={() => {navigate("/map")}}>
                <Map size={20} /> Map View
            </div>
            <Sorter sortState={sortState} setSortState={setSortState}/>
            <Filters checkboxData={checkboxData} setCheckboxData={setCheckboxData} filterOptions={filterOptions}/>
            <div className={recommenderClass} onClick={() => {setIsRecommending(prev => !prev)}}>
                <Star size={20} /> Reccomend Me!
            </div>
        </div>
    );
};

export default FeedSearch;
