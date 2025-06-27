import "../styles/Header.css";
import { useUser } from "../contexts/UserContext";
import { LogOut } from "lucide-react";
import { Route, Routes, useNavigate } from "react-router";
import FeedSearch from "./FeedSearch";

const Header = () => {
    const { user, logOut } = useUser();

    let navigate = useNavigate();
    return (
        <header className="header-container">
            <div
                className="logo-container"
                onClick={() => {
                    navigate("/");
                }}
            >
                <img
                    src="/frog.svg"
                    alt="Origami Logo"
                    className="img-container"
                ></img>
                <h1>Origami</h1>
            </div>
            <Routes>
                <Route path="/feed" element={<FeedSearch />} />
                <Route path="*" element={<></>} />
            </Routes>
            {user ? (
                <LogOut
                    className="logout-button"
                    strokeWidth={3}
                    onClick={logOut}
                />
            ) : (
                <></>
            )}
        </header>
    );
};

export default Header;
