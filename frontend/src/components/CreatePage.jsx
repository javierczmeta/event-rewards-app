import { useFormInput } from "../utils/useFormInput";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ToastContainer, toast, Slide } from "react-toastify";
import CreateMap from "./CreateMap";
import "../styles/CreatePage.css";
import { useNavigate } from "react-router";
import { reverseCreateDateWithOffset } from "../utils/createDateWithOffset";
import LoadingGif from "./LoadingGif";
import { useUser } from "../contexts/UserContext";
import CategorySelector from "./CategorySelector";

const CreatePage = () => {
    const {location, MENLO_PARK_COORDS} = useUser()
    let mapStartPos = location ? location : MENLO_PARK_COORDS

    const formInputs = {
        longitudeProps: useFormInput(mapStartPos.lng),
        latitudeProps: useFormInput(mapStartPos.lat),
        nameProps: useFormInput("")[0],
        imageProps: useFormInput("")[0],
        startDateProps: useFormInput("")[0],
        endDateProps: useFormInput("")[0],
        priceProps: useFormInput()[0],
        descProps: useFormInput("")[0],
        catProps: useFormInput("Miscellaneous")[0],
    };

    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const createEventMutation = useMutation({
        mutationFn: (event) => {
            const url = import.meta.env.VITE_SERVER_API;
            return axios.post(`${url}/events`, event, {
                withCredentials: true,
            });
        },
        onSuccess: () => {
            toast.success("Success");
            queryClient.invalidateQueries("events");
            navigate("/");
        },
        onError: (e) => {
            console.log(e);
            if (e.response) {
                toast.error(e.response.data.message);
            } else {
                toast.error("Unknown Error... Try again later");
            }
        },
    });

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const newEvent = {
            name: formInputs.nameProps.value,
            longitude: formInputs.longitudeProps[0].value,
            latitude: formInputs.latitudeProps[0].value,
            image: formInputs.imageProps.value,
            start_time: reverseCreateDateWithOffset(formInputs.startDateProps.value),
            end_time: reverseCreateDateWithOffset(formInputs.endDateProps.value),
            price: parseInt(formInputs.priceProps.value),
            description: formInputs.descProps.value,
            category: formInputs.catProps.value,
        };
        createEventMutation.mutate(newEvent);
    };

    return (
        <main className="create-main">
            <h2>Create a new event</h2>
            <CreateMap formInputs={formInputs} />
            <p>Longitude: {formInputs.longitudeProps[0].value}</p>
            <p>Latitude: {formInputs.latitudeProps[0].value}</p>
            <form className="create-form" onSubmit={handleFormSubmit}>
                <div className="form-components-container">
                    <input
                        type="text"
                        placeholder="Name"
                        required
                        {...formInputs.nameProps}
                    ></input>

                    <input
                        type="text"
                        placeholder="Image Link"
                        {...formInputs.imageProps}
                    ></input>

                    <div>
                        <label>Start Time: </label>
                        <input
                            type="datetime-local"
                            required
                            {...formInputs.startDateProps}
                            min={new Date(Date.now()).toISOString()}
                        ></input>
                    </div>

                    <div>
                        <label>End Time: </label>
                        <input
                            type="datetime-local"
                            required
                            {...formInputs.endDateProps}
                            min={formInputs.startDateProps.value}
                        ></input>
                    </div>

                    <div>
                        <label>Price in $</label>
                        <input
                            type="number"
                            placeholder="Price"
                            required
                            {...formInputs.priceProps}
                        ></input>
                    </div>

                    <input
                        type="text"
                        placeholder="Description"
                        {...formInputs.descProps}
                    ></input>

                    <CategorySelector selectorOptions={formInputs.catProps}/>
                </div>
                {createEventMutation.isPending || createEventMutation.isSuccess ? <LoadingGif/> : (<button type="submit">Create</button>)}
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
        </main>
    );
};

export default CreatePage;
