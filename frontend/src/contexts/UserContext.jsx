import { createContext, useContext, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {useLocalStorage} from "@uidotdev/usehooks"

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const getUserProfile = useQuery({
        queryKey: ['user', document.cookie],
        queryFn: () => {
            const url = import.meta.env.VITE_SERVER_API;
            return axios.get(`${url}/me`, {
                withCredentials: true,
            });
        },
        refetchOnWindowFocus: false,
        retry: false
    });

    const [user, setUser] = useLocalStorage("user", null);

    const logOut = () => {
        const url = import.meta.env.VITE_SERVER_API;
        axios.post(`${url}/logout`, {}, {
                withCredentials: true,
            });

        setUser(null);
    }

    useEffect(() => {
        if (getUserProfile.status === "success") {
            setUser(getUserProfile.data.data);
        } else if (getUserProfile.status === "error") {
            setUser(null);
        }
    }, [getUserProfile.status]);


    return (
        <UserContext.Provider value={{ user, refetch: getUserProfile.refetch, logOut }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
