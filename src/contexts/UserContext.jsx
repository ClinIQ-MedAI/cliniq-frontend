import React, { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

const UserContext = createContext(null);

// Derives a single `role` from which of doctor/patient/admin came back non-null.
// No top-level `roles`/`permissions` array exists yet — this is the seam to
// extend once the backend actually adds permissions to doctor/admin/patient.
function normalizeAuthResponse(response) {
    const { user, doctor, patient, admin } = response;

    let role = null;
    let permissions = [];

    if (admin) {
        // admin.roles is an array like ["Admin"] or ["SuperAdmin"]
        role = admin.roles?.[0] ?? "Admin";
        permissions = admin.permissions ?? [];
    } else if (doctor) {
        role = "Doctor";
        permissions = doctor.permissions ?? [];
    } else if (patient) {
        role = "Patient";
        permissions = patient.permissions ?? [];
    }

    return {
        ...user,
        role,
        permissions,
        doctor: doctor ?? null,
        patient: patient ?? null,
        admin: admin ?? null,
    };
}
export function UserProvider({ children }) {
    const [user, setUser] = useState(
        JSON.parse(localStorage.getItem("cliniq_user")) ?? null,
    );
    const [token, setToken] = useState(
        localStorage.getItem("cliniq_token") ?? null,
    );
    const navigate = useNavigate();

    function loginData(response) {
        const normalizedUser = normalizeAuthResponse(response);

        localStorage.setItem("cliniq_user", JSON.stringify(normalizedUser));
        localStorage.setItem("cliniq_token", response.token);
        localStorage.setItem("cliniq_refresh_token", response.refreshToken);

        setUser(normalizedUser);
        setToken(response.token);

        return normalizedUser;
    }

    function updateUser(partialUser) {
        setUser((prev) => {
            const next = { ...prev, ...partialUser };
            localStorage.setItem("cliniq_user", JSON.stringify(next));
            return next;
        });
    }

    function hasPermission(permission) {
        return user?.permissions?.includes(permission) ?? false;
    }

    function logout() {
        localStorage.removeItem("cliniq_user");
        localStorage.removeItem("cliniq_token");
        localStorage.removeItem("cliniq_refresh_token");
        setUser(null);
        setToken(null);
        navigate("/");
    }

    return (
        <UserContext.Provider
            value={{
                user,
                token,
                loginData,
                updateUser,
                logout,
                hasPermission,
            }}
        >
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error("useUser must be used within UserProvider");
    return ctx;
}

export default UserContext;
