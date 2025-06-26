import { useFormInput } from "../utils/useFormInput";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useEffect } from "react";
import { ToastContainer, toast, Slide } from "react-toastify";

const Login = () => {
    const usernameProps = useFormInput("");
    const passProps = useFormInput("");

    const loginMutation = useMutation({
        mutationFn: (user) => {
            const url = import.meta.env.VITE_SERVER_API;
            return axios.post(`${url}/login`, user);
        },
    });

    const handleLoginSubmit = (e) => {
        e.preventDefault();
        let user = {
            username: usernameProps.value,
            password: passProps.value,
        };

        loginMutation.mutate(user);
    };

    useEffect(() => {
        if (loginMutation.isError) {
            if (loginMutation.error.response) {
                toast.error(loginMutation.error.response.data.message);
            } else {
                toast.error("Unknown error...");
            }
        }
        if (loginMutation.isSuccess) {
            toast.success("⭐ Success! Redirecting...");
        }
    }, [loginMutation.status]);

    return (
        <>
            <form className="auth-form" onSubmit={handleLoginSubmit}>
                <h2>Welcome Back!</h2>
                <div className="login-fields">
                    <input
                        type="text"
                        placeholder="Username"
                        {...usernameProps}
                        required
                    ></input>
                    <input
                        type="password"
                        placeholder="Password"
                        {...passProps}
                        required
                    ></input>
                </div>
                <button className="action-button" type="submit">
                    Log In
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

export default Login;
