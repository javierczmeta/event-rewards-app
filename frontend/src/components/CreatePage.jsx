import { useFormInput } from "../utils/useFormInput";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ToastContainer, toast, Slide } from "react-toastify";
import CreateMap from "./CreateMap";
import "../styles/CreatePage.css";
import { useNavigate } from "react-router";
import { reverseCreateDateWithOffset } from "../utils/createDateWithOffset";

const CreatePage = () => {
    const formInputs = {
        longitudeProps: useFormInput(-122.1486120978705),
        latitudeProps: useFormInput(37.4845092388847),
        nameProps: useFormInput(""),
        imageProps: useFormInput(""),
        startDateProps: useFormInput(""),
        endDateProps: useFormInput(""),
        priceProps: useFormInput(),
        descProps: useFormInput(""),
        catProps: useFormInput("Miscellaneous"),
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
            longitude: formInputs.longitudeProps.value,
            latitude: formInputs.latitudeProps.value,
            image: formInputs.imageProps.value,
            start_time: reverseCreateDateWithOffset(formInputs.startDateProps.value),
            end_time: reverseCreateDateWithOffset(formInputs.endDateProps.value),
            price: formInputs.priceProps.value,
            description: formInputs.descProps.value,
            category: formInputs.catProps.value,
        };
        if (newEvent.price === 0) {
            newEvent[price] = "Free"
        }
        createEventMutation.mutate(newEvent);
    };

    return (
        <main className="create-main">
            <h2>Create a new event</h2>
            <CreateMap formInputs={formInputs} />
            <p>Longitude: {formInputs.longitudeProps.value}</p>
            <p>Latitude: {formInputs.latitudeProps.value}</p>
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

                    <select required {...formInputs.catProps}>
                        <option value="Miscellaneous">
                            --Category: Please choose an option--
                        </option>
                        <option value="Music and Arts">Music and Arts</option>
                        <option value="Sports and Fitness">
                            Sports and Fitness
                        </option>
                        <option value="Food and Drink">Food and Drink</option>
                        <option value="Networking and Conferences">
                            Networking and Conferences
                        </option>
                        <option value="Travel and Adventure">
                            Travel and Adventure
                        </option>
                        <option value="Family and Kids">Family and Kids</option>
                        <option value="Charity and Fundraising">
                            Charity and Fundraising
                        </option>
                    </select>
                </div>
                <button type="submit">Create</button>
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
