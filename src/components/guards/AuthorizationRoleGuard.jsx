import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";

export const AuthorizationRoleGuard = ({ allowed }) => {
    const { user } = useUser();
    const location = useLocation();

    // No role yet (fresh signup, no doctor/patient/admin) -> send to survey
    // rather than bouncing to "/", since they're logged in, just incomplete.
    if (user && !user.role && location.pathname !== "/survey") {
        return <Navigate to="/survey" replace />;
    }

    if (!user || !allowed.includes(user.role)) {
        return <Navigate to="/" replace state={{ from: location }} />;
    }

    if (
        (user.role === "Admin" || user.role === "SuperAdmin") &&
        !location.pathname.startsWith("/admin")
    ) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    if (user.role === "Doctor" && user.doctor?.status) {
        const needsSurvey = [
            "INCOMPLETE_PROFILE",
            "PENDING_VERIFICATION",
            "REJECTED",
        ];

        if (
            needsSurvey.includes(user.doctor.status) &&
            location.pathname !== "/survey" &&
            location.pathname !== "/verification-status"
        ) {
            return (
                <Navigate
                    to={
                        user.doctor.status === "INCOMPLETE_PROFILE"
                            ? "/survey"
                            : "/verification-status"
                    }
                    replace
                />
            );
        }

        if (user.doctor.status === "SUSPENDED") {
            return <Navigate to="/" replace />;
        }
    }

    return <Outlet />;
};
