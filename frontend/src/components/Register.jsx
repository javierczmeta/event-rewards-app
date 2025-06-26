import { useFormInput } from "../utils/useFormInput";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useEffect } from "react";
import { ToastContainer, toast, Slide } from "react-toastify";

const Register = () => {
    const nameInput = useFormInput("");
    const usenameInput = useFormInput("");
    const passInput = useFormInput("");
    const repeatInput = useFormInput("");
    const imageInput = useFormInput("");
    const dobInput = useFormInput("");

    const mutation = useMutation({
        mutationFn: (newUser) => {
            const url = import.meta.env.VITE_SERVER_API;
            return axios.post(`${url}/signup`, newUser);
        },
    });

    const handleSignUpSubmit = (e) => {
        e.preventDefault();
        let newUser = {
            username: usenameInput.value,
            display_name: nameInput.value,
            password: passInput.value,
            img_url: imageInput.value,
            dob: dobInput.value,
        };

        mutation.mutate(newUser);
    };

    useEffect(() => {
        if (mutation.isError) {
            toast.error(mutation.error.response.data.message);
        }
        if (mutation.isSuccess) {
            toast.success("⭐ Success creating new user!");
        }
    }, [mutation.status]);

    return (
        <>
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
                <input
                    type="text"
                    placeholder="Image URL"
                    {...imageInput}
                    pattern="^https?:\/\/.*\.(jpg|jpeg|png|gif|bmp|webp)$"
                    title="Submit valid image link."
                ></input>
                <label>Date of Birth:</label>
                <input type="date" {...dobInput} required></input>
                <button
                    className="action-button"
                    type="submit"
                    disabled={mutation.isPending}
                >
                    {mutation.isPending ? "Saving..." : "Sign Up"}
                </button>
            </form>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss={false}
                draggable={false}
                pauseOnHover
                theme="light"
                transition={Slide}
            />
        </>
    );
};

export default Register;
