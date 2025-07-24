import { Settings2 } from "lucide-react";
import "../styles/Filters.css";
import useComponentVisible from "../utils/useComponentVisible";
import { useUser } from "../contexts/UserContext";
import CategorySelector from "./CategorySelector";
import { useFeed } from "../contexts/FeedContext";

const Filters = () => {
    const {checkboxData, setCheckboxData, filterOptions, setNeedsFiltering} = useFeed()

    const {
        ref,
        isComponentVisible: showFilters,
        setIsComponentVisible: setShowFilters,
    } = useComponentVisible(false);

    const {location} = useUser()

    return (
        <>
            <div
                className="feed-tool-container"
                onClick={() => {
                    setShowFilters(!showFilters);
                }}
            >
                <Settings2 size={20} />
                <p>Filter</p>
            </div>
            {showFilters && (
                <div className="filter-overlay">
                    <div ref={ref} className="filter-content">
                        <h3>Filters</h3>
                        <form
                            className="filter-form"
                            onSubmit={(e) => {
                                e.preventDefault();
                                setShowFilters(false);
                                setNeedsFiltering(true)
                            }}
                        >
                            <div className="filter-checkbox">
                                <input
                                    type="checkbox"
                                    checked={checkboxData.after}
                                    onChange={() => {
                                        setCheckboxData({
                                            ...checkboxData,
                                            after: !checkboxData.after,
                                        });
                                    }}
                                ></input>
                                <p>➡️ After a date</p>
                            </div>
                            {checkboxData.after && (
                                <input
                                    type="datetime-local"
                                    min={new Date(Date.now())}
                                    required
                                    {...filterOptions.afterProps}
                                />
                            )}

                            <label className="filter-checkbox">
                                <input
                                    type="checkbox"
                                    checked={checkboxData.before}
                                    onChange={() => {
                                        setCheckboxData({
                                            ...checkboxData,
                                            before: !checkboxData.before,
                                        });
                                    }}
                                />
                                <p>⬅️ Before a date</p>
                            </label>
                            {checkboxData.before && (
                                <input
                                    type="datetime-local"
                                    min={new Date(Date.now())}
                                    required
                                    {...filterOptions.beforeProps}
                                />
                            )}

                            <label className="filter-checkbox">
                                <input
                                    type="checkbox"
                                    disabled={location === null}
                                    checked={checkboxData.closer}
                                    onChange={() => {
                                        setCheckboxData({
                                            ...checkboxData,
                                            closer: !checkboxData.closer,
                                        });
                                    }}
                                />
                                <p>🌍 Closer Than {location === null ? "(Need location permissions)" : ""}</p>
                            </label>
                            {checkboxData.closer && (
                                <input
                                    type="number"
                                    placeholder="Distance in Km"
                                    required
                                    min={0}
                                    {...filterOptions.closerProps}
                                />
                            )}

                            <label className="filter-checkbox">
                                <input
                                    type="checkbox"
                                    checked={checkboxData.category}
                                    onChange={() => {
                                        setCheckboxData({
                                            ...checkboxData,
                                            category: !checkboxData.category,
                                        });
                                    }}
                                />
                                <p>📊 By category</p>
                            </label>
                            {checkboxData.category && (
                                <CategorySelector selectorOptions={filterOptions.categoryProps}/>
                            )}

                            <button type="submit" className="root-button">
                                Done
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Filters;
