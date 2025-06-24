import "../styles/Header.css"

const Header = () => {
    return (
        <header className="header-container">
            <div className="logo-container">
                <img src="/frog.svg" alt="Origami Logo" className="img-container"></img>
                <h1>Origami</h1>
            </div>
        </header>
    )
}

export default Header;