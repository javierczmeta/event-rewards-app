import "../styles/FeedSearch.css";
import { Map, Star } from "lucide-react";
import SearchBar from "./SearchBar";
import Sorter from "./Sorter";
import { useNavigate } from "react-router";
import Filters from "./Filters";
import { useFeed } from "../contexts/FeedContext";

const FeedSearch = () => {
    const navigate = useNavigate();
    const {isRecommending, setIsRecommending} = useFeed()

    const recommenderClass = isRecommending ? "feed-tool-container active" : "feed-tool-container"

    return (
        <div className="feed-options-container">
            <SearchBar/>
            <div className="feed-tool-container" onClick={() => {navigate("/map")}}>
                <Map size={20} /> Map View
            </div>
            <Sorter/>
            <Filters/>
            <div className={recommenderClass} onClick={() => {setIsRecommending(prev => !prev)}}>
                <Star size={20} /> Reccomend Me!
            </div>
        </div>
    );
};

export default FeedSearch;
