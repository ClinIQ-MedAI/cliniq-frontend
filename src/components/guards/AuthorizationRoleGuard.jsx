import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";

export const AuthorizationRoleGuard = ({ allowed }) => {
    const { user } = useUser();
    const location = useLocation();

    if (!user || !allowed.includes(user.role)) {
        return <Navigate to="/" replace state={{ from: location }} />;
    }

    if (user.role === "Admin" && !location.pathname.startsWith("/admin")) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    if (user.role === "Doctor") {
        const needsSurvey = [
            "INCOMPLETE_PROFILE",
            "PENDING_VERIFICATION",
            "REJECTED",
        ];

        if (
            needsSurvey.includes(user.doctorStatus) &&
            location.pathname !== "/survey"
        ) {
            return <Navigate to="/survey" replace />;
        }

        if (user.doctorStatus === "SUSPENDED" || user.isDisabled) {
            return <Navigate to="/" replace />;
        }
    }

    return <Outlet />;
};
