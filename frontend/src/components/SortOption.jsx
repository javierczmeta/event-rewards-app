const SortOption = ({ option, setShowSorters, sortState, setSortState }) => {
    const containerClass = "feed-tool-container " + (sortState === option[0] ? "sort-selected" : "")
    
    return (
        <div
            className={containerClass}
            onClick={() => {
                setSortState(option[0]);
                setShowSorters(false);
            }}
        >
            <p>{option[1]}</p>
        </div>
    );
};

export default SortOption;
