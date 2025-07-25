import { useNavigate, Outlet, useLocation } from "react-router";
import "../styles/UserAuthPage.css";
import { useUser } from "../contexts/UserContext";
import { useEffect } from "react";

const UserAuthPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const { user } = useUser();

    useEffect(() => {
        if (user) {
            navigate("/");
        }
    }, [user]);

    const path = location.pathname;

    const loginClass = "auth-button " + (path === "/login" ? "active" : "");
    const signupClass = "auth-button " + (path === "/signup" ? "active" : "");

    return (
        <main className="auth-main">
            <section className="auth-form-container">
                <div className="auth-nav">
                    <button
                        onClick={() => {
                            navigate("/login");
                        }}
                        className={loginClass}
                    >
                        <p>Log In</p>
                    </button>
                    <button
                        onClick={() => {
                            navigate("/signup");
                        }}
                        className={signupClass}
                    >
                        <p>Sign Up</p>
                    </button>
                </div>
                <Outlet />
            </section>
        </main>
    );
};

export default UserAuthPage;
