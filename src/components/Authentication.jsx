import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

export const Authentication = ({ allowed }) => {
    const { user } = useUser();

    if (!allowed.includes(user?.role)) {
        return <Navigate to={"/"} />;
    } else if (user?.doctorStatus === "INCOMPLETE_PROFILE") {
        return <Navigate to={"/survey"} />;
    } else if (user?.doctorStatus === "PENDING_VERIFICATION") {
        return <Navigate to={"/survey"} />;
    } else if (user?.doctorStatus === "REJECTED") {
        return <Navigate to={"/survey"} />;
    } else if (user?.doctorStatus === "SUSPENDED" || user?.isDisabled) {
        return <Navigate to={"/"} />;
    }
    return <Outlet />;
};
