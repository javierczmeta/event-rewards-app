const SchedulingOptions = ({
    withCommute,
    setWithCommute,
    profitModes,
    setProfitModes,
}) => {

    const handleProfitClick = (property) => {
        const newProfits = {...profitModes}
        newProfits[property].on = !profitModes[property].on
        setProfitModes(newProfits)
    }

    const handleSliderMove = (e, property) => {
        e.stopPropagation()
        const newProfits = {...profitModes}
        newProfits[property].weight = e.target.value
        setProfitModes(newProfits)
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
                    <p>Without Commute Times</p>
                </div>
            ) : (
                <div
                    className="schedule-button"
                    onClick={() => {
                        setWithCommute(false);
                    }}
                >
                    <p>With Commute Times</p>
                </div>
            )}

            <div className="profit-container">
                <h3>Profit Modes:</h3>
                <div className="profit-modes-container">
                    <div
                        className={
                            "profit-mode " +
                            (profitModes.points.on ? "active" : "")
                        }
                        onClick={() => {handleProfitClick('points')}}
                    >
                        <p>Maximize Points</p>
                        <p>({profitModes.points.weight})</p>
                        <input 
                            type="range" 
                            min={0.05} 
                            max={1} 
                            step={0.05} 
                            value={profitModes.points.weight} 
                            onChange={(e) => {handleSliderMove(e, 'points')}}
                            onClick={(e) => {e.stopPropagation()}}
                            ></input>
                    </div>
                    <div
                        className={
                            "profit-mode " +
                            (profitModes.distance.on ? "active" : "")
                        }
                        onClick={() => {handleProfitClick('distance')}}
                    >
                        <p>Minimize Distance</p>
                        <p>({profitModes.distance.weight})</p>
                        <input 
                            type="range" 
                            min={0.05} 
                            max={1} 
                            step={0.05} 
                            value={profitModes.distance.weight} 
                            onChange={(e) => {handleSliderMove(e, 'distance')}}
                            onClick={(e) => {e.stopPropagation()}}
                        ></input>
                    </div>
                    <div
                        className={
                            "profit-mode " +
                            (profitModes.price.on ? "active" : "")
                        }
                        onClick={() => {handleProfitClick('price')}}
                    >
                        <p>Minimize Cost</p>
                        <p>({profitModes.price.weight})</p>
                        <input 
                            type="range" 
                            min={0.05} 
                            max={1} 
                            step={0.05} 
                            value={profitModes.price.weight} 
                            onChange={(e) => {handleSliderMove(e, 'price')}}
                            onClick={(e) => {e.stopPropagation()}}
                            ></input>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SchedulingOptions;
