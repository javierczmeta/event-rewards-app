import { useFormInput } from "../utils/useFormInput";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useEffect } from "react";
import { ToastContainer, toast, Slide } from "react-toastify";
import { useUser } from "../contexts/UserContext";
import LoadingGif from "./LoadingGif";

const Login = () => {
    const usernameProps = useFormInput("")[0];
    const passProps = useFormInput("")[0];
    const {refetch} = useUser();

    const loginMutation = useMutation({
        mutationFn: (user) => {
            if (!user.username || !user.password) {
                throw new Error("No username or password");
            }
            const url = import.meta.env.VITE_SERVER_API;
            return axios.post(`${url}/login`, user, {
                withCredentials: true,
            });
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
        if (loginMutation.isPending) {
        }
        if (loginMutation.isError) {
            if (loginMutation.error.response) {
                toast.error(loginMutation.error.response.data.message);
            } else {
                toast.error("Unknown Error... Try again later");
            }
        }
        if (loginMutation.isSuccess) {
            toast.success("⭐ Success! Redirecting...");
            refetch();
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
                {loginMutation.isPending || loginMutation.isSuccess ? (
                    <LoadingGif />
                ) : (
                    <button className="action-button" type="submit">
                        Log In
                    </button>
                )}
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
