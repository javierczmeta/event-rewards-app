import { createContext, useContext } from "react";

const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
    const CATEGORY_OPTIONS = {
        default: "Miscellaneous",
        options: [
            "Music and Arts",
            "Sports and Fitness",
            "Food and Drink",
            "Networking and Conferences",
            "Travel and Adventure",
            "Family and Kids",
            "Charity and Fundraising",
        ],
    };

    return (
        <CategoryContext.Provider value={CATEGORY_OPTIONS}>
            {children}
        </CategoryContext.Provider>
    );
};

export const useCategories = () => useContext(CategoryContext);
