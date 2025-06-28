import { Search } from "lucide-react";
import { useState } from "react";

const SearchBar = ({searchFieldProps}) => {
    const [expanded, setExpanded] = useState(false);
    const searchClass = "feed-tool-container" + (expanded ? " expanded" : "");

    return (
        <div
            className={searchClass}
            onClick={() => {
                setExpanded(!expanded);
            }}
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
