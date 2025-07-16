import { createContext, useContext, useEffect, useState } from "react";
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

    const MENLO_PARK_COORDS = {lng: -122.1486120978705, lat: 37.4845092388847}
    const [userLocation, setUserLocation] = useState(MENLO_PARK_COORDS)

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

        //get user's actual location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.error('Error getting location:', error);
                    setUserLocation(MENLO_PARK_COORDS);
                }
            );
        } else {
            setUserLocation(MENLO_PARK_COORDS);
        }
    }, []);


    return (
        <UserContext.Provider value={{ user, refetch: getUserProfile.refetch, logOut, location: userLocation}}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
