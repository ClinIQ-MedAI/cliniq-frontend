import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import toast from "react-hot-toast";

export const Authentication = () => {
    const { token } = useUser();
    const navigate = useNavigate();
    if (!token) {
        toast("not logged in try logging in to your account");
        return navigate("/");
    }

    return <Outlet />;
};
