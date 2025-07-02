import { useFormInput } from "../utils/useFormInput";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { ToastContainer, toast, Slide } from "react-toastify";
import CreateMap from "./CreateMap";
import "../styles/CreatePage.css";

const CreatePage = () => {
    const formInputs = {
        longitudeProps: useFormInput(-122.1486120978705),
        latitudeProps: useFormInput(37.4845092388847),
        nameProps: useFormInput(""),
        imageProps: useFormInput(""),
        startDateProps: useFormInput(""),
        endDateProps: useFormInput(""),
        priceProps: useFormInput(),
        catProps: useFormInput("Miscellaneous"),
    };

    return (
        <main className="create-main">
            <h2>Create a new event</h2>
            <CreateMap formInputs={formInputs} />
            <p>Longitude: {formInputs.longitudeProps.value}</p>
            <p>Latitude: {formInputs.latitudeProps.value}</p>
            <form className="create-form">
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
                        ></input>
                    </div>

                    <div>
                        <label>End Time: </label>
                        <input
                            type="datetime-local"
                            required
                            {...formInputs.endDateProps}
                        ></input>
                    </div>

                    <div>
                        <label>Price in $</label>
                        <input type="number" placeholder="Price" required {...formInputs.priceProps}></input>
                    </div>

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
