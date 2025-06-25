const Login = () => {
    return (
        <form className="auth-form">
            <h2>Welcome Back!</h2>
            <div className="login-fields">
                <input type="text" placeholder="Username"></input>
                <input type="password" placeholder="Password"></input>
            </div>
            <button className="action-button">Log In</button>
        </form>
    );
};

export default Login;
