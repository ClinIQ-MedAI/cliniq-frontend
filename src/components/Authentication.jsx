import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import toast from "react-hot-toast";

export const Authentication = () => {
    const { token } = useUser();

    useEffect(() => {
        if (!token) {
            toast("not logged in try logging in to your account");
        }
    }, [token]);

    if (!token) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};
