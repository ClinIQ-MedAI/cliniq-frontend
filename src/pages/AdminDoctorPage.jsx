import {
    Moon,
    Sun,
    Search,
    Unlock,
    Lock,
    Check,
    X,
    Loader2,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useState, useEffect } from "react";
import api from "../apis/api";
import { toast } from "react-hot-toast";
import API_ENDPOINTS from "../apis/endpoints";

const STATUS_CONFIG = {
    ACTIVE: {
        label: "Active",
        cls: "bg-green-500/10 text-green-600 dark:text-green-400",
    },
    SUSPENDED: {
        label: "Suspended",
        cls: "bg-red-500/10 text-red-600 dark:text-red-400",
    },
    PENDING_VERIFICATION: {
        label: "Pending Verification",
        cls: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    },
    REJECTED: {
        label: "Rejected",
        cls: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    },
    INCOMPLETE_PROFILE: {
        label: "Incomplete",
        cls: "bg-gray-500/10 text-gray-500",
    },
};

const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] ?? {
        label: status,
        cls: "bg-gray-500/10 text-gray-500",
    };
    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}
        >
            {cfg.label}
        </span>
    );
};

/* ── Reject modal ── */
const RejectModal = ({ doctor, onConfirm, onClose }) => {
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        if (!reason.trim()) {
            toast.error("Please enter a rejection reason.");
            return;
        }
        setLoading(true);
        await onConfirm(doctor.id, reason);
        setLoading(false);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={onClose}
        >
            <div
                className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-lg font-bold text-t1 mb-1">
                    Reject Doctor
                </h3>
                <p className="text-sm text-t2 mb-4">
                    You are rejecting{" "}
                    <span className="font-semibold text-t1">
                        {doctor.firstName} {doctor.lastName}
                    </span>
                    . Please provide a reason.
                </p>
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    placeholder="e.g. License photo was unclear..."
                    className="w-full px-4 py-3 rounded-xl border-2 border-border text-sm text-t1 bg-page focus:outline-none focus:border-red-400 transition-colors resize-none"
                />
                <div className="flex gap-3 mt-4">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-t2 bg-subtle border border-border hover:bg-card transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-60"
                    >
                        {loading ? (
                            <Loader2 size={15} className="animate-spin" />
                        ) : (
                            <X size={15} />
                        )}
                        Reject
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ── Main component ── */
export const AdminDoctors = () => {
    const { toggle, theme } = useTheme();
    /** @type {[import('../types.js').DoctorResponse[], Function]} */
    const [doctors, setDoctors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchInput, setSearchInput] = useState("");
    const [filterInput, setFilterInput] = useState("all");
    const [rejectTarget, setRejectTarget] = useState(null); // doctor to reject
    const [loadingId, setLoadingId] = useState(null); // which doctor's action is loading

    useEffect(() => {
        fetchDoctors();
    }, []);
    async function fetchDoctors() {
        try {
            /** @type {{ data: import("../types.js").DoctorResponse[] }} */
            const response = await api.get(
                API_ENDPOINTS.Admin.Doctor.getListOfDoctorsOrCreateDoctor,
            );
            setDoctors(response.data);
        } catch (error) {
            toast.error("Failed to load doctors.");
        } finally {
            setIsLoading(false);
        }
    }

    /* ── Actions ── */
    const handleApprove = async (id) => {
        setLoadingId(id);
        try {
            await api.post(API_ENDPOINTS.Admin.Doctor.approveDoctor(id));
            setDoctors((prev) =>
                prev.map((d) => (d.id === id ? { ...d, status: "ACTIVE" } : d)),
            );
            toast.success("Doctor approved successfully.");
        } catch {
            toast.error("Failed to approve doctor.");
        } finally {
            setLoadingId(null);
        }
    };

    const handleReject = async (id, reason) => {
        try {
            await api.post(API_ENDPOINTS.Admin.Doctor.rejectDoctor(id), {
                reason,
            });
            setDoctors((prev) =>
                prev.map((d) =>
                    d.id === id ? { ...d, status: "REJECTED" } : d,
                ),
            );
            toast.success("Doctor rejected.");
            setRejectTarget(null);
        } catch {
            toast.error("Failed to reject doctor.");
        }
    };

    const handleToggleSuspend = async (doctor) => {
        setLoadingId(doctor.id);
        try {
            if (doctor.isDisabled) {
                await api.put(
                    API_ENDPOINTS.Admin.Doctor.unlockDoctor(doctor.id),
                );
                setDoctors((prev) =>
                    prev.map((d) =>
                        d.id === doctor.id
                            ? { ...d, isDisabled: false, status: "ACTIVE" }
                            : d,
                    ),
                );
                toast.success("Doctor unlocked.");
            } else {
                await api.patch(
                    API_ENDPOINTS.Admin.Doctor.updateDoctorStatus(doctor.id),
                    {
                        active: false,
                    },
                );
                setDoctors((prev) =>
                    prev.map((d) =>
                        d.id === doctor.id
                            ? { ...d, isDisabled: true, status: "SUSPENDED" }
                            : d,
                    ),
                );
                toast.success("Doctor suspended.");
            }
        } catch {
            toast.error("Action failed.");
        } finally {
            setLoadingId(null);
        }
    };

    /* ── Filter ── */
    const filteredDoctors = doctors.filter((doctor) => {
        const matchesSearch =
            searchInput === "" ||
            doctor.firstName
                ?.toLowerCase()
                .includes(searchInput.toLowerCase()) ||
            doctor.lastName
                ?.toLowerCase()
                .includes(searchInput.toLowerCase()) ||
            doctor.email?.toLowerCase().includes(searchInput.toLowerCase());

        const matchesFilter =
            filterInput === "all" || doctor.status === filterInput;

        return matchesSearch && matchesFilter;
    });

    return (
        <div className="bg-page w-full px-5 py-2">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-t1">
                        Doctors Directory
                    </h2>
                    <p className="text-t2 mt-1">
                        Manage and monitor all registered doctors.
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative w-full md:w-64">
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-t3 pointer-events-none"
                        />
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search doctors..."
                            className="w-full pl-9 pr-4 py-2 bg-subtle border border-border rounded-lg text-t1 text-sm focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                    <select
                        value={filterInput}
                        onChange={(e) => setFilterInput(e.target.value)}
                        className="px-4 py-2 bg-subtle border border-border rounded-lg text-t1 text-sm focus:outline-none focus:border-primary transition-colors"
                    >
                        <option value="all">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="PENDING_VERIFICATION">Pending</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="SUSPENDED">Suspended</option>
                        <option value="INCOMPLETE_PROFILE">Incomplete</option>
                    </select>
                    <button
                        onClick={toggle}
                        className="p-2 text-t2 hover:text-primary hover:bg-subtle rounded-full transition-colors"
                    >
                        {theme === "light" ? (
                            <Moon size={22} />
                        ) : (
                            <Sun size={22} />
                        )}
                    </button>
                </div>
            </header>

            {/* Table */}
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-subtle text-t2 text-sm border-b border-border">
                            <th className="p-4 font-medium">Doctor Name</th>
                            <th className="p-4 font-medium">Email</th>
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
                                    className="py-12 text-center text-t3"
                                >
                                    <Loader2
                                        size={24}
                                        className="animate-spin mx-auto mb-2"
                                        style={{ color: "#185FA5" }}
                                    />
                                    Loading doctors...
                                </td>
                            </tr>
                        ) : filteredDoctors.length === 0 ? (
                            <tr>
                                <td
                                    colSpan="4"
                                    className="py-12 text-center text-t3 text-sm"
                                >
                                    No doctors found.
                                </td>
                            </tr>
                        ) : (
                            filteredDoctors.map((doctor) => (
                                <tr
                                    key={doctor.id}
                                    className="border-b border-border hover:bg-subtle transition-colors"
                                >
                                    <td className="p-4 font-medium text-t1">
                                        {doctor.firstName} {doctor.lastName}
                                    </td>
                                    <td className="p-4 text-t2 text-sm">
                                        {doctor.email}
                                    </td>
                                    <td className="p-4">
                                        <StatusBadge status={doctor.status} />
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-end gap-2">
                                            {/* Approve / Reject — for PENDING only */}
                                            {doctor.status ===
                                                "PENDING_VERIFICATION" && (
                                                <>
                                                    <button
                                                        onClick={() =>
                                                            handleApprove(
                                                                doctor.id,
                                                            )
                                                        }
                                                        disabled={
                                                            loadingId ===
                                                            doctor.id
                                                        }
                                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 transition-colors disabled:opacity-50"
                                                    >
                                                        {loadingId ===
                                                        doctor.id ? (
                                                            <Loader2
                                                                size={13}
                                                                className="animate-spin"
                                                            />
                                                        ) : (
                                                            <Check size={13} />
                                                        )}
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            setRejectTarget(
                                                                doctor,
                                                            )
                                                        }
                                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors"
                                                    >
                                                        <X size={13} /> Reject
                                                    </button>
                                                </>
                                            )}

                                            {/* Suspend / Unlock — for ACTIVE or SUSPENDED */}
                                            {(doctor.status === "ACTIVE" ||
                                                doctor.status ===
                                                    "SUSPENDED") && (
                                                <button
                                                    onClick={() =>
                                                        handleToggleSuspend(
                                                            doctor,
                                                        )
                                                    }
                                                    disabled={
                                                        loadingId === doctor.id
                                                    }
                                                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                                                        doctor.isDisabled
                                                            ? "bg-primary/10 text-primary hover:bg-primary/20"
                                                            : "bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20"
                                                    }`}
                                                >
                                                    {loadingId === doctor.id ? (
                                                        <Loader2
                                                            size={13}
                                                            className="animate-spin"
                                                        />
                                                    ) : doctor.isDisabled ? (
                                                        <Unlock size={13} />
                                                    ) : (
                                                        <Lock size={13} />
                                                    )}
                                                    {doctor.isDisabled
                                                        ? "Unlock"
                                                        : "Suspend"}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Reject Modal */}
            {rejectTarget && (
                <RejectModal
                    doctor={rejectTarget}
                    onConfirm={handleReject}
                    onClose={() => setRejectTarget(null)}
                />
            )}
        </div>
    );
};
