import { useEffect } from "react";

// from: https://stackoverflow.com/questions/32553158/detect-click-outside-react-component 

/**
 * Hook that alerts clicks outside of the passed ref
 */
export function useOutsideAlerter(ref, func) {
    useEffect(() => {
        /**
         * Alert if clicked on outside of element
         */
        function handleClickOutside(event) {
            if (ref.current && !ref.current.contains(event.target)) {
                func()
            }
        }
        // Bind the event listener
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [ref]);
}
