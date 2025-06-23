import "./styles/App.css";
import { Routes, Route } from "react-router-dom";

function App() {
    return (
        <>
            <Routes>
                <Route path="/" element={<div>Root Page</div>}/>
            </Routes>
        </>
    );
}

export default App;
