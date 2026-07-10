import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";

export const AuthorizationRoleGuard = ({ allowed }) => {
    const { user } = useUser();
    const location = useLocation();
    if (!user || (user.roles.length > 0 && !allowed.includes(user.roles[0]))) {
        return <Navigate to="/" replace state={{ from: location }} />;
    }

    if (
        user.roles &&
        user.roles.length > 0 &&
        user.roles[0] === "Admin" &&
        !location.pathname.startsWith("/admin")
    ) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    if (user.doctor && user.doctor.status) {
        const needsSurvey = [
            "INCOMPLETE_PROFILE",
            "PENDING_VERIFICATION",
            "REJECTED",
        ];

        if (
            needsSurvey.includes(user.doctor.status) &&
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
