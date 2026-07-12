import React, { useState, useEffect, useMemo } from "react";
import {
    Search,
    Lock,
    Unlock,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import api from "../apis/api";
import { useTheme } from "../contexts/ThemeContext";
import { Moon } from "lucide-react";
import { Sun } from "lucide-react";
import API_ENDPOINTS from "../apis/endpoints";
import { useUser } from "../contexts/UserContext";

const PAGE_SIZE_OPTIONS = [10, 25, 50];

// Builds a windowed page list with ellipsis, e.g. [1, "...", 4, 5, 6, "...", 12]
function getPageWindow(current, total) {
    const delta = 1;
    const range = [];
    const rangeWithDots = [];
    let last;

    for (let i = 1; i <= total; i++) {
        if (
            i === 1 ||
            i === total ||
            (i >= current - delta && i <= current + delta)
        ) {
            range.push(i);
        }
    }

    for (const i of range) {
        if (last) {
            if (i - last === 2) rangeWithDots.push(last + 1);
            else if (i - last > 2) rangeWithDots.push("...");
        }
        rangeWithDots.push(i);
        last = i;
    }

    return rangeWithDots;
}

export const AdminPatients = () => {
    const { hasPermission } = useUser();
    const canUpdate = hasPermission("Permissions.Patients.Update");
    /** @type {[import("../types").PatientResponse,Function]} */
    const [patients, setPatients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toggle, theme } = useTheme();

    // Pagination state (frontend-only — backend doesn't support it yet)
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
    const [searchPatient, setSearchPatient] = useState("");
    // Fetch patients on mount
    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        setIsLoading(true);
        try {
            /**@type {{data: import("../types").PatientResponse}} */
            const res = await api.get(
                API_ENDPOINTS.Admin.Patient.getOrCreatePatients,
            );

            setPatients(res.data);
            setCurrentPage(1);
        } catch (error) {
            console.error("Failed to fetch patients", error);
        } finally {
            setIsLoading(false);
        }
        return;
    };
    // Handle Suspend / Unlock
    const handleToggleStatus = async (patient) => {
        try {
            if (patient.status === "SUSPENDED") {
                // If disabled, unlock them
                await api.patch(
                    API_ENDPOINTS.Admin.Patient.updatePatientStatus(patient.id),
                    { active: true },
                );
            } else {
                // If active, suspend them (active: false)
                await api.patch(
                    API_ENDPOINTS.Admin.Patient.updatePatientStatus(patient.id),
                    {
                        active: false,
                    },
                );
            }
            // Refresh the list to reflect changes
            fetchPatients();
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    const totalPages = Math.max(1, Math.ceil(patients.length / pageSize));

    // Keep current page in range if the list or page size shrinks it out of bounds
    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(totalPages);
    }, [totalPages, currentPage]);

    const startIndex = (currentPage - 1) * pageSize;
    const paginatedPatients = useMemo(
        () => patients.slice(startIndex, startIndex + pageSize),
        [patients, startIndex, pageSize],
    );

    const filteredPatients = useMemo(() => {
        let filteredPatients = [];
        paginatedPatients.forEach((p) => {
            if (
                p.firstName.includes(searchPatient) ||
                p.lastName.includes(searchPatient) ||
                p.email.includes(searchPatient) ||
                searchPatient === ""
            ) {
                filteredPatients.push(p);
            }
        });
        return filteredPatients;
    }, [paginatedPatients, searchPatient]);
    const rangeStart = patients.length === 0 ? 0 : startIndex + 1;
    const rangeEnd = Math.min(startIndex + pageSize, patients.length);

    const handlePageSizeChange = (e) => {
        setPageSize(Number(e.target.value));
        setCurrentPage(1);
    };

    return (
        <div className="p-4 sm:p-6 md:p-8 w-full min-h-screen bg-page">
            {/* Header & Search */}
            <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-t1">
                        Patients Directory
                    </h2>
                    <p className="text-t2 mt-1">
                        Manage and monitor all registered patients.
                    </p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <button
                        onClick={() => toggle()}
                        className="p-2 text-t2 hover:text-primary hover:bg-subtle rounded-full transition-colors shrink-0"
                    >
                        {theme === "light" ? (
                            <Moon size={24} />
                        ) : (
                            <Sun size={24} />
                        )}
                    </button>
                    <div className="relative flex-1 md:w-72">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={18} className="text-t3" />
                        </div>
                        <input
                            type="text"
                            value={searchPatient}
                            onChange={(e) => setSearchPatient(e.target.value)}
                            placeholder="Search patients..."
                            className="w-full pl-10 pr-4 py-2 bg-subtle border border-border rounded-lg text-t1 focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                </div>
            </header>

            {/* Patients Table */}
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden transition-colors duration-300">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] text-left border-collapse">
                        <thead>
                            <tr className="bg-subtle text-t2 text-sm border-b border-border">
                                <th className="p-4 font-medium">
                                    Patient Name
                                </th>
                                <th className="p-4 font-medium">
                                    Email Address
                                </th>
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
                                filteredPatients.map((patient) => (
                                    <tr
                                        key={patient.id}
                                        className="border-b border-border-sub hover:bg-subtle transition-colors"
                                    >
                                        <td className="p-4 font-medium text-t1">
                                            {patient.firstName}{" "}
                                            {patient.lastName}
                                        </td>
                                        <td className="p-4 text-t2">
                                            {patient.email}
                                        </td>
                                        <td className="p-4">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    patient.status ===
                                                    "SUSPENDED"
                                                        ? "bg-red-500/10 text-red-600 dark:text-red-400"
                                                        : "bg-green-500/10 text-green-600 dark:text-green-400"
                                                }`}
                                            >
                                                {patient.status === "SUSPENDED"
                                                    ? "Suspended"
                                                    : "Active"}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-end gap-2">
                                                {canUpdate && (
                                                    <button
                                                        onClick={() =>
                                                            handleToggleStatus(
                                                                patient,
                                                            )
                                                        } /* ...unchanged... */
                                                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                                                            patient.status ===
                                                            "SUSPENDED"
                                                                ? "bg-primary/10 text-primary hover:bg-primary/20"
                                                                : "bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20"
                                                        }`}
                                                    >
                                                        {patient.status ===
                                                        "SUSPENDED" ? (
                                                            <>
                                                                <Unlock
                                                                    size={16}
                                                                />{" "}
                                                                Unlock
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Lock
                                                                    size={16}
                                                                />{" "}
                                                                Suspend
                                                            </>
                                                        )}
                                                    </button>
                                                )}{" "}
                                                <button className="p-1.5 text-t3 hover:text-t1 transition-colors rounded-lg hover:bg-border-sub">
                                                    <MoreVertical size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination footer */}
                {!isLoading && patients.length > 0 && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-t border-border bg-subtle text-sm">
                        <div className="flex flex-wrap items-center gap-3 text-t2">
                            <span>
                                Showing {rangeStart}–{rangeEnd} of{" "}
                                {patients.length} patients
                            </span>
                            <select
                                value={pageSize}
                                onChange={handlePageSizeChange}
                                className="px-2 py-1 bg-page border border-border rounded-lg text-t1 text-xs focus:outline-none focus:border-primary transition-colors"
                            >
                                {PAGE_SIZE_OPTIONS.map((size) => (
                                    <option key={size} value={size}>
                                        {size} / page
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-1 flex-wrap">
                            <button
                                onClick={() =>
                                    setCurrentPage((p) => Math.max(1, p - 1))
                                }
                                disabled={currentPage === 1}
                                className="p-1.5 rounded-lg text-t2 hover:text-primary hover:bg-page disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
                                aria-label="Previous page"
                            >
                                <ChevronLeft size={16} />
                            </button>

                            {getPageWindow(currentPage, totalPages).map(
                                (page, idx) =>
                                    page === "..." ? (
                                        <span
                                            key={`dots-${idx}`}
                                            className="px-2 text-t3"
                                        >
                                            …
                                        </span>
                                    ) : (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`min-w-[28px] px-2 py-1 rounded-lg transition-colors ${
                                                page === currentPage
                                                    ? "bg-primary text-white font-medium"
                                                    : "text-t2 hover:bg-page hover:text-t1"
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ),
                            )}

                            <button
                                onClick={() =>
                                    setCurrentPage((p) =>
                                        Math.min(totalPages, p + 1),
                                    )
                                }
                                disabled={currentPage === totalPages}
                                className="p-1.5 rounded-lg text-t2 hover:text-primary hover:bg-page disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
                                aria-label="Next page"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
