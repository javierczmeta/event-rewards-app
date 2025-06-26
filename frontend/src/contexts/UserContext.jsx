import { createContext, useState, useContext, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {useLocalStorage} from "@uidotdev/usehooks"

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const { status, data, error, refetch } = useQuery({
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
        if (status === "success") {
            setUser(data.data);
        } else if (status === "error") {
            setUser(null);
        }
    }, [status]);


    return (
        <UserContext.Provider value={{ user, refetch }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
