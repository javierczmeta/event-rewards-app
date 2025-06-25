import { useFormInput } from "../utils/useFormInput";

const Login = () => {
    const usernameProps = useFormInput("");
    const passProps = useFormInput("");

    const handleLoginSubmit = (e) => {
        e.preventDefault();
    }

    return (
        <form className="auth-form" onSubmit={handleLoginSubmit}>
            <h2>Welcome Back!</h2>
            <div className="login-fields">
                <input type="text" placeholder="Username" {...usernameProps} required></input>
                <input type="password" placeholder="Password" {...passProps} required></input>
            </div>
            <button className="action-button" type="submit">Log In</button>
        </form>
    );
};

export default Login;
