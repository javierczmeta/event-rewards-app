import { Search } from "lucide-react";
import { useRef, useState } from "react";
import { useOutsideAlerter } from "../utils/useOutsideAlerter";

const SearchBar = ({searchFieldProps}) => {
    const [expanded, setExpanded] = useState(false);
    const searchClass = "feed-tool-container" + (expanded ? " expanded" : "");

    const wrapperRef = useRef(null);
    useOutsideAlerter(wrapperRef, () => {if (expanded) {setExpanded(!expanded)}})

    return (
        <div
            className={searchClass}
            onClick={() => {
                setExpanded(!expanded);
            }}
            ref={wrapperRef}
        >
            {expanded ? (
                <form onSubmit={(e) => {e.preventDefault()}}>
                    <input type="text" className="search-input" autoFocus placeholder="Search Bar" {...searchFieldProps}></input>
                </form>
            ) : (
                <p>Search Bar</p>
            )}

            <Search
                className="feed-search-icon"
                strokeWidth={3}
                size={25}
                color="white"
            />
        </div>
    );
};

export default SearchBar;
