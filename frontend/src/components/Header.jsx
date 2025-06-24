import "../styles/Header.css"
import { useNavigate } from "react-router";

const Header = () => {
    let navigate = useNavigate();
    return (
        <header className="header-container" onClick={() => {navigate("/")}}>
            <div className="logo-container">
                <img src="/frog.svg" alt="Origami Logo" className="img-container"></img>
                <h1>Origami</h1>
            </div>
        </header>
    )
}

export default Header;