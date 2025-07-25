import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

const WithAuth = (WrappedComponent) => {
    return function ProtectedComponent(props) {
        const { user } = useUser();
        const navigate = useNavigate();

        useEffect(() => {
            if (!user) {
                navigate("/login");
            }
        }, [user]);

        if (!user) {
            return <p>Loading...</p>; 
        }

        return <WrappedComponent {...props} />;
    };
};

export default WithAuth;