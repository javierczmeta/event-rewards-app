import { createContext, useState, useContext, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {useLocalStorage} from "@uidotdev/usehooks"

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const getUserProfile = useQuery({
        queryKey: ["user"],
        queryFn: () => {
            const url = import.meta.env.VITE_SERVER_API;
            return axios.get(`${url}/me`, {
                withCredentials: true,
            });
        },
        refetchOnWindowFocus: false
    });
    const [user, setUser] = useLocalStorage("user", null);

    useEffect(() => {
        if (getUserProfile.status === "success") {
            setUser(getUserProfile.data.data);
        } else if (getUserProfile.status === "error") {
            setUser(null);
        }
    }, [getUserProfile.status]);


    return (
        <UserContext.Provider value={{ user, refetch: getUserProfile.refetch }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
