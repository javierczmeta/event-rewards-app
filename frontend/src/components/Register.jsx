const Register = () => {
    return (
        <form className="auth-form">
            <h2>Create an Account</h2>
            <input type="text" placeholder="Display Name"></input>
            <input type="text" placeholder="Username"></input>
            <input type="password" placeholder="Password"></input>
            <input type="password" placeholder="Repeat Password"></input>
            <label>Date of Birth:</label>
            <input type="date"></input>
            <button className="action-button">Sign Up</button>
        </form>
    )
}

export default Register;