import { useState, useEffect } from "react";
import {
    Moon,
    Sun,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Calendar,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import api from "../apis/api";
import { toast } from "react-hot-toast";
import API_ENDPOINTS from "../apis/endpoints";

const STATUS_CONFIG = {
    PENDING: {
        label: "Pending",
        cls: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    },
    CONFIRMED: {
        label: "Confirmed",
        cls: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    COMPLETED: {
        label: "Completed",
        cls: "bg-green-500/10 text-green-600 dark:text-green-400",
    },
    CANCELLED: {
        label: "Cancelled",
        cls: "bg-red-500/10 text-red-600 dark:text-red-400",
    },
};

const STATUS_OPTIONS = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];

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

const formatDate = (iso) =>
    new Date(iso).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });

const PAGE_SIZE = 10;

export const AdminBookings = () => {
    const { toggle, theme } = useTheme();

    const [bookings, setBookings] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState("all");

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState(null);

    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    useEffect(() => {
        fetchBookings(page);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    async function fetchBookings(pageNumber) {
        try {
            setIsLoading(true);
            setError("");
            const res = await api.get(
                API_ENDPOINTS.Admin.Booking.getAllBookings,
                { params: { page: pageNumber, pageSize: PAGE_SIZE } },
            );
            setBookings(res.data?.data ?? []);
            setTotal(res.data?.total ?? 0);
        } catch (err) {
            setError(
                err?.response?.data?.title ??
                    err?.response?.data?.message ??
                    "Failed to load bookings.",
            );
        } finally {
            setIsLoading(false);
        }
    }

    const handleStatusChange = async (bookingId, newStatus) => {
        setUpdatingId(bookingId);
        try {
            await api.put(
                API_ENDPOINTS.Admin.Booking.updateBookingStatus(bookingId),
                { status: newStatus },
            );
            setBookings((prev) =>
                prev.map((b) =>
                    b.id === bookingId ? { ...b, status: newStatus } : b,
                ),
            );
            toast.success("Booking status updated.");
        } catch {
            toast.error("Failed to update booking status.");
        } finally {
            setUpdatingId(null);
        }
    };

    const visibleBookings =
        statusFilter === "all"
            ? bookings
            : bookings.filter((b) => b.status === statusFilter);

    return (
        <div className="bg-page w-full px-5 py-2">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-t1">Bookings</h2>
                    <p className="text-t2 mt-1">
                        View and manage all appointments across the clinic.
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 bg-subtle border border-border rounded-lg text-t1 text-sm focus:outline-none focus:border-primary transition-colors"
                    >
                        <option value="all">All Status</option>
                        {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                                {STATUS_CONFIG[s].label}
                            </option>
                        ))}
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
                            <th className="p-4 font-medium">Patient</th>
                            <th className="p-4 font-medium">Doctor</th>
                            <th className="p-4 font-medium">Date</th>
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
                                    colSpan="5"
                                    className="py-12 text-center text-t3"
                                >
                                    <Loader2
                                        size={24}
                                        className="animate-spin mx-auto mb-2"
                                        style={{ color: "#185FA5" }}
                                    />
                                    Loading bookings...
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td
                                    colSpan="5"
                                    className="py-12 text-center text-red-600 text-sm"
                                >
                                    {error}
                                </td>
                            </tr>
                        ) : visibleBookings.length === 0 ? (
                            <tr>
                                <td
                                    colSpan="5"
                                    className="py-12 text-center text-t3 text-sm"
                                >
                                    <Calendar
                                        size={24}
                                        className="mx-auto mb-2 text-t3"
                                    />
                                    No bookings found.
                                </td>
                            </tr>
                        ) : (
                            visibleBookings.map((booking) => (
                                <tr
                                    key={booking.id}
                                    className="border-b border-border hover:bg-subtle transition-colors"
                                >
                                    <td className="p-4 font-medium text-t1">
                                        {booking.patientName}
                                    </td>
                                    <td className="p-4 text-t2 text-sm">
                                        {booking.doctorName}
                                    </td>
                                    <td className="p-4 text-t2 text-sm">
                                        {formatDate(booking.date)}
                                    </td>
                                    <td className="p-4">
                                        <StatusBadge status={booking.status} />
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-end gap-2">
                                            {updatingId === booking.id ? (
                                                <Loader2
                                                    size={16}
                                                    className="animate-spin text-t3"
                                                />
                                            ) : (
                                                <select
                                                    value={booking.status}
                                                    onChange={(e) =>
                                                        handleStatusChange(
                                                            booking.id,
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="px-2 py-1.5 bg-subtle border border-border rounded-lg text-t1 text-xs focus:outline-none focus:border-primary transition-colors"
                                                >
                                                    {STATUS_OPTIONS.map((s) => (
                                                        <option
                                                            key={s}
                                                            value={s}
                                                        >
                                                            {
                                                                STATUS_CONFIG[s]
                                                                    .label
                                                            }
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {!isLoading && !error && total > 0 && (
                <div className="flex items-center justify-between mt-4 text-sm text-t2">
                    <span>
                        Page {page} of {totalPages} · {total} total bookings
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page <= 1}
                            className="p-2 rounded-lg border border-border bg-subtle hover:bg-card transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            onClick={() =>
                                setPage((p) => Math.min(totalPages, p + 1))
                            }
                            disabled={page >= totalPages}
                            className="p-2 rounded-lg border border-border bg-subtle hover:bg-card transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
