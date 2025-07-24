import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import "../styles/ImagePicker.css";
import { useFormInput } from "../utils/useFormInput";
import LoadingGif from "./LoadingGif";
import UserImage from "./UserImage";
import { ToastContainer, toast, Slide } from "react-toastify";


const ImagePicker = ({ imageInput }) => {
    const [imageQueryProps, _] = useFormInput("");

    const imageMutation = useMutation({
        mutationFn: (search) => {
            const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_KEY;
            const url = `https://api.unsplash.com/photos/random?client_id=${UNSPLASH_KEY}&orientation=squarish&query=${search}`;
            return axios.get(url);
        },
        onSuccess: (data) => {imageInput[1].setValue(data.data.urls.regular); toast.success("Success setting image!")},
        onError: (e) => {toast.error("An error happened, try again later..."); console.error(e)}
    });

    return (
        <>
            <div className="image-picker-container">
                <UserImage
                    className="image-picker-image"
                    image={imageMutation.isSuccess ? imageMutation.data.data.urls.small : null}
                />
                <input
                    type="text"
                    placeholder="Search Photos"
                    {...imageQueryProps}
                ></input>
                {imageMutation.isPending ? (
                    <div>
                        <LoadingGif className="loading-container-image" />
                    </div>
                ) : (
                    <div
                        onClick={() => {
                            imageMutation.mutate(imageQueryProps.value);
                        }}
                    >
                        <p>Search</p>
                    </div>
                )}
                
            </div>
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

export default ImagePicker;
