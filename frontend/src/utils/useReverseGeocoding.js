import { useQuery } from "@tanstack/react-query";

import axios from "axios";

export const useReverseGeocoding = (id, longitude, latitude) => {
    return useQuery({
        queryKey: [id],
        queryFn: () => {
            const apiToken = import.meta.env.VITE_GEOCODING_TOKEN;
            const url = `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${longitude}&latitude=${latitude}&access_token=${apiToken}`;
            return axios.get(url);
        },
        refetchOnWindowFocus: false,
    });
};
