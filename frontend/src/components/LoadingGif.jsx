import "../styles/LoadingGif.css"

const LoadingGif = () => {
    return (<div className="loading-container">
        <img src="../loading.gif" className="loading-gif"></img>
        <p>Loading...</p>
    </div>)
}

export default LoadingGif;