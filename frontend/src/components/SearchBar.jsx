import { Search } from "lucide-react";
import useComponentVisible from "../utils/useComponentVisible";
import { useFeed } from "../contexts/FeedContext";

const SearchBar = () => {
    const {ref, isComponentVisible: expandBar, setIsComponentVisible: setExpandBar} = useComponentVisible(false);
    const searchClass = "feed-tool-container" + (expandBar ? " expanded" : "");

    const {searchFieldProps} = useFeed()

    return (
        <div
            className={searchClass}
            onClick={() => {
                setExpandBar(!expandBar)
            }}
            ref={ref}
        >
            {expandBar ? (
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                    }}
                >
                    <input
                        type="text"
                        className="search-input"
                        autoFocus
                        placeholder="Search Bar"
                        {...searchFieldProps}
                    ></input>
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
