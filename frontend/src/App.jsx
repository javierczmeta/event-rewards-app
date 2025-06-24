import Header from "./components/Header";
import Footer from "./components/Footer";
import "./styles/App.css";
import { Routes, Route } from "react-router-dom";

function App() {
    return (
        <>
            <Header/>
            <Routes>
                <Route path="/" element={<div>Root Page</div>}/>
            </Routes>
            <Footer/>
        </>
    );
}

export default App;
