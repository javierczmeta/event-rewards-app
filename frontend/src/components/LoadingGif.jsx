import "../styles/LoadingGif.css"

const LoadingGif = ({className}) => {
    if (!className) {
        className = "loading-container"
    }

    return (<div className={className}>
        <img src="../loading.gif" className="loading-gif"></img>
        <p>Loading...</p>
    </div>)
}

export default LoadingGif;