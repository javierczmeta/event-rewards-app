import { useFormInput } from "../utils/useFormInput";

const Register = () => {
    const nameInput = useFormInput("");
    const usenameInput = useFormInput("");
    const passInput = useFormInput("");
    const repeatInput = useFormInput("");
    const dobInput = useFormInput("");


    const handleSignUpSubmit = (e) => {
        e.preventDefault();
    }

    return (
        <form className="auth-form" onSubmit={handleSignUpSubmit}>
            <h2>Create an Account</h2>
            <input
                type="text"
                placeholder="Display Name"
                {...nameInput}
                required
            ></input>
            <input
                type="text"
                placeholder="Username"
                {...usenameInput}
                required
                minLength={3}
                maxLength={30}
            ></input>
            <input
                type="password"
                placeholder="Password"
                {...passInput}
                required
                minLength={8}
            ></input>
            <input
                type="password"
                placeholder="Repeat Password"
                {...repeatInput}
                required
                pattern={`${passInput.value}`}
                title="Match password"
            ></input>
            <label>Date of Birth:</label>
            <input type="date" {...dobInput} required></input>
            <button className="action-button" type="sumbit">Sign Up</button>
        </form>
    );
};

export default Register;
