import { Outlet, Navigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";

export const RequirePermission = ({ permission }) => {
    const { hasPermission } = useUser();

    if (!hasPermission(permission)) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    return <Outlet />;
};
