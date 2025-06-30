import "../styles/Sorter.css";
import { Funnel } from "lucide-react";
import useComponentVisible from "../utils/useComponentVisible";
import { useState } from "react";
import FilterOption from "./FilterOption";

const Sorter = () => {
    const {
        ref,
        isComponentVisible: showSorters,
        setIsComponentVisible: setShowSorters,
    } = useComponentVisible(false);
    const [sortState, setSortState] = useState(null);

    const sortOptions = [
        "Name",
        "Event Start Date",
        "Event Posting Date",
        "Points",
    ];

    const containerClass = "feed-tool-container " + (sortState ? "sort-selected" : "")

    if (!showSorters) {
        return (
            <div
                className={containerClass}
                onClick={() => {
                    setShowSorters(true);
                }}
            >
                <Funnel size={20} /> {sortState ? "Sorting by " + sortState : "Sort"} 
            </div>
        );
    } else {
        return <div ref={ref} className="sorters-container">
            {sortOptions.map((option, index) => (
                <FilterOption option={option} key={index} setShowSorters={setShowSorters} sortState={sortState} setSortState={setSortState}/>
            ))}
        </div>
    }
};

export default Sorter;
