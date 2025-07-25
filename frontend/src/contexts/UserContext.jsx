import { createContext, useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {useLocalStorage} from "@uidotdev/usehooks"
import { useNavigate } from "react-router";

const UserContext = createContext();

export const UserProvider = ({ children }) => {

    const navigate = useNavigate()
    
    const getUserProfile = useQuery({
        queryKey: ['user', document.cookie],
        queryFn: () => {
            const url = import.meta.env.VITE_SERVER_API;
            return axios.get(`${url}/me`, {
                withCredentials: true,
            });
        },
        refetchOnWindowFocus: false,
        retry: false,
        refetchInterval: 1000 * 60 // every minute
    });

    const [user, setUser] = useLocalStorage("user", null);
    const [savedEvents, setSavedEvents]= useState(new Set())

    const MENLO_PARK_COORDS = {lng: -122.1486120978705, lat: 37.4845092388847}
    const [userLocation, setUserLocation] = useState(null)

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
            setSavedEvents(new Set(getUserProfile.data.data.profile.saved_events.map(e => e.id)))
        } else if (getUserProfile.status === "error") {
            setUser(null);
            navigate("/")
        }
    }, [getUserProfile.data, getUserProfile.status]);

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
                    setUserLocation(null);
                }
            );
        } else {
            setUserLocation(null);
            
        }
    }, []);


    return (
        <UserContext.Provider value={{ user, savedEvents, refetch: getUserProfile.refetch, logOut, location: userLocation, MENLO_PARK_COORDS}}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
