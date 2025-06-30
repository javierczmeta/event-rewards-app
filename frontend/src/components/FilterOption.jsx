const FilterOption = ({ option, setShowSorters, sortState, setSortState }) => {
    const containerClass = "feed-tool-container " + (sortState === option ? "sort-selected" : "")
    
    return (
        <div
            className={containerClass}
            onClick={() => {
                setSortState(option);
                setShowSorters(false);
            }}
        >
            <p>{option}</p>
        </div>
    );
};

export default FilterOption;
