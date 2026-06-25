// src/Services/authService.js
const BASE = "http://localhost:3001";

// ── Login ────────────────────────────────────────────────────
export const login = async (email, password) => {
    const res = await fetch(
        `${BASE}/doctors?email=${email}&password=${password}`,
    );
    const doctors = await res.json();

    if (doctors.length === 0) {
        throw new Error("Invalid email or password");
    }

    const doctor = doctors[0];
    // بنخزن الداكتور في localStorage من غير الباسورد
    const { password: _, ...safeDoctor } = doctor;
    localStorage.setItem("cliniq_user", JSON.stringify(safeDoctor));
    return safeDoctor;
};

// ── Signup ───────────────────────────────────────────────────
export const signup = async (name, email, password, specialty) => {
    // نتأكد إن الإيميل مش موجود
    const check = await fetch(`${BASE}/doctors?email=${email}`);
    const existing = await check.json();

    if (existing.length > 0) {
        throw new Error("Email already registered");
    }

    const newDoctor = {
        name,
        email,
        password,
        specialty: specialty || "General Practitioner",
        degree: "",
        hospital: "Cliniq Hospital",
        location: "",
        experience: "",
        workingHours: "",
        awards: "",
        image: "/default-avatar.jpg",
        specialties: [],
        rating: 0,
        totalPatients: 0,
        monthlyRevenue: 0,
    };

    const res = await fetch(`${BASE}/doctors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDoctor),
    });

    const created = await res.json();
    const { password: _, ...safeDoctor } = created;
    localStorage.setItem("cliniq_user", JSON.stringify(safeDoctor));
    return safeDoctor;
};

// ── Logout ───────────────────────────────────────────────────
export const logout = () => {
    localStorage.removeItem("cliniq_user");
};

// ── Get current user ─────────────────────────────────────────
export const getCurrentUser = () => {
    const data = localStorage.getItem("cliniq_user");
    return data ? JSON.parse(data) : null;
};
