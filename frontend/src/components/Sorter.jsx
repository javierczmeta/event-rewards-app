import "../styles/Sorter.css";
import { Funnel } from "lucide-react";
import useComponentVisible from "../utils/useComponentVisible";
import SortOption from "./SortOption";
import { useFeed } from "../contexts/FeedContext";

const Sorter = () => {
    const {sortState, setSortState} = useFeed()

    const {
        ref,
        isComponentVisible: showSorters,
        setIsComponentVisible: setShowSorters,
    } = useComponentVisible(false);

    const sortOptions = [
        ['name' ,"Name"],
        ['start', "Event Start Date"],
        ['posting', "Event Posting Date"],
        ['points', "Points"],
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
                <Funnel size={20} /> 
                <p>{sortState ? "Sorting by " + sortOptions.find(x => x[0] === sortState)[1] : "Sort"}</p>
            </div>
        );
    } else {
        return <div ref={ref} className="sorters-container">
            {sortOptions.map((option, index) => (
                <SortOption option={option} key={index} setShowSorters={setShowSorters} sortState={sortState} setSortState={setSortState}/>
            ))}
        </div>
    }
};

export default Sorter;
