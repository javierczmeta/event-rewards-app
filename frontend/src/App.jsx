import Header from "./components/Header";
import Footer from "./components/Footer";
import "./styles/App.css";
import { Routes, Route } from "react-router-dom";
import UserAuthPage from "./components/UserAuthPage";
import Login from "./components/Login";
import Register from "./components/Register";

function App() {
    return (
        <>
            <Header />
            <Routes>
                <Route path="/" element={<div>Root Page</div>} />
                <Route element={<UserAuthPage />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Register />} />
                </Route>
            </Routes>
            <Footer />
        </>
    );
}

export default App;