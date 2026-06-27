import React, { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

const UserContext = createContext(null);

export function UserProvider({ children }) {
    const [user, setUser] = useState(
        JSON.parse(localStorage.getItem("cliniq_user")) ?? null,
    );
    const [token, setToken] = useState(
        localStorage.getItem("cliniq_token") ?? null,
    );
    const navigate = useNavigate();

    //TODO:Edit Login Logic when api finishes
    function loginData(user, token) {
        localStorage.setItem("cliniq_user", JSON.stringify(user));
        localStorage.setItem("cliniq_token", token);
        setUser(user);
        setToken(token);
    }
    function logout() {
        localStorage.removeItem("cliniq_user");
        localStorage.removeItem("cliniq_token");
        setUser(null);
        setToken(null);
        navigate("/");
    }
    return (
        <UserContext.Provider value={{ user, token, loginData, logout }}>
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
