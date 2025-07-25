import { createContext, useContext, useState } from "react";
import { useFormInput } from "../utils/useFormInput";

const FeedContext = createContext();

export const FeedProvider = ({ children }) => {
    // Search states
    const searchFieldProps = useFormInput("")[0]

    // Sorting states
    const [sortState, setSortState] = useState("")
    const [isRecommending,setIsRecommending] = useState(false)

    // Filter props
    const [checkboxData, setCheckboxData] = useState({
        after: false,
        before: false,
        closer: false,
        category: null,
    });
    const filterOptions = {
        afterProps: useFormInput(null)[0],
        beforeProps: useFormInput(null)[0],
        closerProps: useFormInput(null)[0],
        categoryProps: useFormInput("Miscellaneous")[0],
    };
    const [needsFiltering, setNeedsFiltering] = useState(false)


    return (
        <FeedContext.Provider value={{searchFieldProps, sortState, setSortState, isRecommending, setIsRecommending, checkboxData, setCheckboxData, filterOptions, needsFiltering, setNeedsFiltering}}>
            {children}
        </FeedContext.Provider>
    );
};

export const useFeed = () => useContext(FeedContext);
