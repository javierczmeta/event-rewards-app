import "../styles/Header.css";
import { useNavigate } from "react-router";
import { useUser } from "../contexts/UserContext";
import { LogOut } from "lucide-react";

const Header = () => {
    const { user, logOut } = useUser();

    let navigate = useNavigate();
    return (
        <header
            className="header-container"
            onClick={() => {
                navigate("/");
            }}
        >
            <div className="logo-container">
                <img
                    src="/frog.svg"
                    alt="Origami Logo"
                    className="img-container"
                ></img>
                <h1>Origami</h1>
            </div>

            {user ? (
                <LogOut className="logout-button" strokeWidth={3} onClick={logOut}/>
            ) : (
                <></>
            )}
        </header>
    );
};

export default Header;
