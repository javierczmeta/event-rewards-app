import { useFormInput } from "../utils/useFormInput";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useEffect } from "react";
import { ToastContainer, toast, Slide } from "react-toastify";
import LoadingGif from "./LoadingGif";
import ImagePicker from "./ImagePicker";
import { useNavigate } from "react-router";

const Register = () => {
    const nameInput = useFormInput("")[0];
    const usenameInput = useFormInput("")[0];
    const passInput = useFormInput("")[0];
    const repeatInput = useFormInput("")[0];
    const imageInput = useFormInput("")[0];
    const dobInput = useFormInput("")[0];

    const signUpMutation = useMutation({
        mutationFn: (newUser) => {
            const url = import.meta.env.VITE_SERVER_API;
            return axios.post(`${url}/signup`, newUser);
        },
    });

    const navigate = useNavigate();

    const handleSignUpSubmit = (e) => {
        e.preventDefault();
        let newUser = {
            username: usenameInput.value,
            display_name: nameInput.value,
            password: passInput.value,
            img_url: imageInput.value,
            dob: dobInput.value,
        };

        signUpMutation.mutate(newUser);
    };

    useEffect(() => {
        if (signUpMutation.isError) {
            if (signUpMutation.error.response) {
                toast.error(signUpMutation.error.response.data.message);
            } else {
                toast.error("Unknown error...");
            }
        }
        if (signUpMutation.isSuccess) {
            toast.success("⭐ Success creating new user!");
            navigate('/login');
        }
    }, [signUpMutation.status]);

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
                <ImagePicker imageInput={imageInput}/>
                <label>Date of Birth:</label>
                <input type="date" {...dobInput} required></input>
                {signUpMutation.isPending || signUpMutation.isSuccess ? (
                    <LoadingGif className='loading-container-image'/>
                ) : (
                    <button className="action-button" type="submit">
                        Sign Up
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

export default Register;
