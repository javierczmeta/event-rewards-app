const SchedulingOptions = ({
    withCommute,
    setWithCommute,
    profitModes,
    setProfitModes,
}) => {

    const handleProfitClick = (property) => {
        if (profitModes.includes(property)) {
            setProfitModes(profitModes.filter(x => x != property))
        } else{
            setProfitModes(profitModes.concat(property))
        }
    }

    return (
        <div className="scheduling-settings-container">
            {!withCommute ? (
                <div
                    className="schedule-button gray"
                    onClick={() => {
                        setWithCommute(true);
                    }}
                >
                    Without Commute Times
                </div>
            ) : (
                <div
                    className="schedule-button"
                    onClick={() => {
                        setWithCommute(false);
                    }}
                >
                    With Commute Times
                </div>
            )}

            <div className="profit-container">
                <h3>Profit Modes:</h3>
                <div className="profit-modes-container">
                    <div
                        className={
                            "profit-mode " +
                            (profitModes.includes("points") ? "active" : "")
                        }
                        onClick={() => {handleProfitClick('points')}}
                    >
                        Points
                    </div>
                    <div
                        className={
                            "profit-mode " +
                            (profitModes.includes("distance") ? "active" : "")
                        }
                        onClick={() => {handleProfitClick('distance')}}
                    >
                        Distance
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SchedulingOptions;
