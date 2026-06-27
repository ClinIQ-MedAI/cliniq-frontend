import React, { useState, useEffect } from "react";
import { Search, Lock, Unlock, MoreVertical } from "lucide-react";
import api from "../apis/api";
import { useTheme } from "../contexts/ThemeContext";
import { Moon } from "lucide-react";
import { Sun } from "lucide-react";
import API_ENDPOINTS from "../apis/endpoints";

export const AdminPatients = () => {
    const [patients, setPatients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toggle, theme } = useTheme();
    // 1. Fetch patients on mount
    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        setIsLoading(true);
        try {
            const res = await api.get(
                "http://localhost:5000/api/admin/patients?page=1",
            );
            setPatients(res.data.items);
        } catch (error) {
            console.error("Failed to fetch patients", error);
        } finally {
            setIsLoading(false);
        }
    };

    // 2. Handle Suspend / Unlock
    const handleToggleStatus = async (patient) => {
        try {
            if (patient.isDisabled) {
                // If disabled, unlock them
                await api.put(API_ENDPOINTS.unlockPatient(patient.id));
            } else {
                // If active, suspend them (active: false)
                await api.patch(API_ENDPOINTS.updatePatientStatus(patient.id), {
                    active: false,
                });
            }
            // Refresh the list to reflect changes
            fetchPatients();
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    return (
        <div className="p-8 w-full bg-page">
            {/* Header & Search */}
            <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-t1">
                        Patients Directory
                    </h2>
                    <p className="text-t2 mt-1">
                        Manage and monitor all registered patients.
                    </p>
                </div>
                <div className="flex items-center">
                    <button
                        onClick={() => toggle()}
                        className="p-2 text-t2 hover:text-primary hover:bg-subtle rounded-full transition-colors"
                    >
                        {theme === "light" ? (
                            <Moon size={24} />
                        ) : (
                            <Sun size={24} />
                        )}
                    </button>
                    <div className="relative w-full md:w-72">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={18} className="text-t3" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search patients..."
                            className="w-full pl-10 pr-4 py-2 bg-subtle border border-border rounded-lg text-t1 focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                </div>
            </header>

            {/* Patients Table */}
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden transition-colors duration-300">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-subtle text-t2 text-sm border-b border-border">
                            <th className="p-4 font-medium">Patient Name</th>
                            <th className="p-4 font-medium">Email Address</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium text-right">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td
                                    colSpan="4"
                                    className="p-4 text-center text-t3 py-8"
                                >
                                    Loading patients...
                                </td>
                            </tr>
                        ) : patients.length === 0 ? (
                            <tr>
                                <td
                                    colSpan="4"
                                    className="p-4 text-center text-t3 py-8"
                                >
                                    No patients found.
                                </td>
                            </tr>
                        ) : (
                            patients.map((patient) => (
                                <tr
                                    key={patient.id}
                                    className="border-b border-border-sub hover:bg-subtle transition-colors"
                                >
                                    <td className="p-4 font-medium text-t1">
                                        {patient.firstName} {patient.lastName}
                                    </td>
                                    <td className="p-4 text-t2">
                                        {patient.email}
                                    </td>
                                    <td className="p-4">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                patient.isDisabled
                                                    ? "bg-red-500/10 text-red-600 dark:text-red-400"
                                                    : "bg-green-500/10 text-green-600 dark:text-green-400"
                                            }`}
                                        >
                                            {patient.isDisabled
                                                ? "Suspended"
                                                : "Active"}
                                        </span>
                                    </td>
                                    <td className="p-4 flex justify-end gap-2">
                                        <button
                                            onClick={() =>
                                                handleToggleStatus(patient)
                                            }
                                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                                                patient.isDisabled
                                                    ? "bg-primary/10 text-primary hover:bg-primary/20"
                                                    : "bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20"
                                            }`}
                                        >
                                            {patient.isDisabled ? (
                                                <>
                                                    <Unlock size={16} /> Unlock
                                                </>
                                            ) : (
                                                <>
                                                    <Lock size={16} /> Suspend
                                                </>
                                            )}
                                        </button>
                                        <button className="p-1.5 text-t3 hover:text-t1 transition-colors rounded-lg hover:bg-border-sub">
                                            <MoreVertical size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
