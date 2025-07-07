import "../styles/Header.css";
import { useUser } from "../contexts/UserContext";
import { LogOut } from "lucide-react";
import { Route, Routes, useNavigate } from "react-router";
import FeedSearch from "./FeedSearch";
import MapTools from "./MapTools";

const Header = ({searchFieldProps, sortState, setSortState}) => {
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
                <Route path="/feed" element={<FeedSearch searchFieldProps={searchFieldProps} sortState={sortState} setSortState={setSortState}/>} />
                <Route path="/map" element={<MapTools/>}/>
                <Route path="*" element={<div></div>} />
            </Routes>
            {user ? (
                <LogOut
                    className="logout-button"
                    strokeWidth={3}
                    size={30}
                    onClick={logOut}
                />
            ) : (
                <></>
            )}
        </header>
    );
};

export default Header;
