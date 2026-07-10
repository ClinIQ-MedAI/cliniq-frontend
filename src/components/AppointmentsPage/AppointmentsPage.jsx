import React, { useState, useEffect, useMemo } from "react";
import { Search, Frown } from "lucide-react";
import API_ENDPOINTS from "../../apis/endpoints";
import api from "../../apis/api";
const ini = (name = "") =>
    name
        .split(" ")
        .filter(Boolean)
        .map((p) => p[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

const PER_PAGE = 5;

// Matches Booking.Doctor's DoctorBookingResponse:
// { id, patientId, patientName, patientEmail, patientPhone, date, status }
// `date` is a DateOnly (e.g. "2026-07-10", no time) and `status` is the
// BookingStatus enum serialized as a string.
const STATUS_META = {
    PENDING: { label: "Pending", pill: "bg-[#FAEEDA] text-[#854F0B]" },
    CONFIRMED: { label: "Confirmed", pill: "bg-[#E1F5EE] text-[#0F6E56]" },
    COMPLETED: { label: "Completed", pill: "bg-[#EAF1FB] text-[#185FA5]" },
    CANCELLED: { label: "Cancelled", pill: "bg-[#FCEBEB] text-[#A32D2D]" },
};

const FILTERS = ["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];

const METRIC_COLORS = {
    blue: "text-[#185FA5]",
    amber: "text-[#854F0B]",
    green: "text-[#0F6E56]",
    red: "text-[#A32D2D]",
};

function MetricCard({ value, label, color }) {
    return (
        <div className="bg-subtle rounded-lg px-4 py-3">
            <div className={`text-2xl font-medium ${METRIC_COLORS[color]}`}>
                {value}
            </div>
            <div className="text-xs text-slate-500 mt-1">{label}</div>
        </div>
    );
}

function StatusPill({ status }) {
    const meta = STATUS_META[status] ?? {
        label: status ?? "Unknown",
        pill: "bg-subtle text-t2",
    };
    return (
        <span
            className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full ${meta.pill}`}
        >
            {meta.label}
        </span>
    );
}

// Formats whatever the backend sends for `date` (date-only or full ISO
// datetime) into a friendly "Jan 27, 2:30 PM" style string.
function formatDateTime(value) {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    const hasTime = /\d{2}:\d{2}/.test(value);
    return d.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        ...(hasTime && { hour: "numeric", minute: "2-digit" }),
    });
}

export default function AppointmentsPage() {
    const [data, setData] = useState([]);
    const [filter, setFilter] = useState("ALL");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    useEffect(() => {
        async function getMyBookings() {
            try {
                setIsLoading(true);
                setLoadError("");

                // GET /api/schedules/bookings -> bare array of DoctorBookingResponse
                const response = await api.get(
                    API_ENDPOINTS.Doctor.getDoctorScheduleBookings,
                );
                setData(response.data ?? []);
            } catch (err) {
                setLoadError(
                    err?.response?.data?.title ??
                        err?.response?.data?.message ??
                        "Failed to load appointments",
                );
            } finally {
                setIsLoading(false);
            }
        }
        getMyBookings();
    }, []);

    useEffect(() => {
        setPage(1);
    }, [filter, search]);

    const filtered = data.filter((a) => {
        if (filter !== "ALL" && a.status !== filter) return false;
        if (search) {
            const q = search.toLowerCase();
            if (!a.patientName?.toLowerCase().includes(q)) return false;
        }
        return true;
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    const safePage = Math.min(page, totalPages);
    const slice = filtered.slice(
        (safePage - 1) * PER_PAGE,
        safePage * PER_PAGE,
    );
    const start = filtered.length ? (safePage - 1) * PER_PAGE + 1 : 0;
    const end = Math.min(safePage * PER_PAGE, filtered.length);

    // Optimistically updates a booking's status locally after confirming
    // the change against the backend.
    // Backend route is PATCH /api/schedules/bookings/{id}/status with body
    // { status: "CONFIRMED" | "CANCELLED" | "COMPLETED" | "PENDING" } —
    // must be PATCH, not PUT, or the server returns 405.
    async function updateBookingStatus(bookingId, newStatus) {
        try {
            await api.patch(
                API_ENDPOINTS.Schedules.editBookingStatusInSchedule(bookingId),
                { status: newStatus },
            );
        } catch (err) {
            // TODO: surface an error toast / revert optimistic update
            console.error("Failed to update booking status", err);
            return;
        }

        setData((prev) =>
            prev.map((a) =>
                a.id === bookingId ? { ...a, status: newStatus } : a,
            ),
        );
    }

    const handleAccept = (bookingId) =>
        updateBookingStatus(bookingId, "CONFIRMED");
    const handleReject = (bookingId) =>
        updateBookingStatus(bookingId, "CANCELLED");

    const counts = useMemo(
        () => ({
            total: data.length,
            pending: data.filter((a) => a.status === "PENDING").length,
            confirmed: data.filter((a) => a.status === "CONFIRMED").length,
            completed: data.filter((a) => a.status === "COMPLETED").length,
        }),
        [data],
    );

    return (
        <div className="flex flex-col gap-5 pb-8 px-5 pt-3">
            <title>Appointments - ClinIQ</title>
            <div>
                <h1 className="text-xl font-medium text-t1">Appointments</h1>
                <p className="text-sm text-t2 mt-1">
                    All bookings made against your schedule
                </p>
            </div>

            <div className="grid grid-cols-4 gap-3">
                <MetricCard value={counts.total} label="Total" color="blue" />
                <MetricCard
                    value={counts.pending}
                    label="Pending"
                    color="amber"
                />
                <MetricCard
                    value={counts.confirmed}
                    label="Confirmed"
                    color="green"
                />
                <MetricCard
                    value={counts.completed}
                    label="Completed"
                    color="blue"
                />
            </div>

            <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[180px]">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search by patient name…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-card text-t1 placeholder:text-t3 focus:outline-none focus:border-[#185FA5] transition-colors"
                    />
                </div>
                <div className="flex gap-1.5 flex-wrap">
                    {FILTERS.map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-full text-xs border transition-colors cursor-pointer
                ${
                    filter === f
                        ? "bg-[#EEF3FB] border-[#185FA5] text-[#185FA5] font-medium"
                        : "bg-card border-border text-t2 hover:bg-subtle hover:text-t1"
                }`}
                        >
                            {f === "ALL" ? "All" : (STATUS_META[f]?.label ?? f)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
                {isLoading ? (
                    <div className="py-10 text-center text-sm text-t2">
                        Loading appointments...
                    </div>
                ) : loadError ? (
                    <div className="py-10 text-center text-sm text-red-600">
                        {loadError}
                    </div>
                ) : slice.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-10 text-t2 text-sm">
                        <Frown className="w-7 h-7" />
                        <p>No appointments match your search.</p>
                        <button
                            onClick={() => {
                                setFilter("ALL");
                                setSearch("");
                            }}
                            className="mt-1 px-4 py-1.5 rounded-lg border border-slate-200 text-slate-600
                         text-sm hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                            Clear filters
                        </button>
                    </div>
                ) : (
                    <table className="w-full text-sm border-collapse table-fixed">
                        <colgroup>
                            <col className="w-[32%]" />
                            <col className="w-[28%]" />
                            <col className="w-[18%]" />
                            <col className="w-[22%]" />
                        </colgroup>
                        <thead>
                            <tr className="bg-subtle border-b border-border-sub">
                                {["Patient", "Date", "Status", "Actions"].map(
                                    (h) => (
                                        <th
                                            key={h}
                                            className="text-[11px] font-medium text-t3 px-3.5 py-2.5 text-left"
                                        >
                                            {h}
                                        </th>
                                    ),
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {slice.map((a) => (
                                <tr
                                    key={a.id}
                                    className="border-b border-border-sub last:border-none hover:bg-subtle transition-colors"
                                >
                                    <td className="px-3.5 py-2.5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-[#E6F1FB] text-[#0C447C] flex items-center justify-center text-[11px] font-medium shrink-0">
                                                {ini(a.patientName)}
                                            </div>
                                            <span className="text-t1">
                                                {a.patientName ?? "—"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-3.5 py-2.5 text-t2">
                                        {formatDateTime(a.date)}
                                    </td>
                                    <td className="px-3.5 py-2.5">
                                        <StatusPill status={a.status} />
                                    </td>
                                    <td className="px-3.5 py-2.5">
                                        {a.status === "PENDING" ? (
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    onClick={() =>
                                                        handleAccept(a.id)
                                                    }
                                                    className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-[#E1F5EE] text-[#0F6E56] hover:bg-[#CFEEE3] transition-colors cursor-pointer"
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleReject(a.id)
                                                    }
                                                    className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-[#FCEBEB] text-[#A32D2D] hover:bg-[#F9D9D9] transition-colors cursor-pointer"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-t3 text-xs">
                                                —
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {!isLoading && !loadError && filtered.length > 0 && (
                    <div className="flex items-center justify-between px-3.5 py-2.5 border-t border-border-sub flex-wrap gap-2">
                        <span className="text-xs text-t3">
                            Showing {start}–{end} of {filtered.length}
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() =>
                                    setPage((p) => Math.max(p - 1, 1))
                                }
                                disabled={safePage === 1}
                                aria-label="Previous page"
                                className="w-7 h-7 flex items-center justify-center rounded-md border border-border bg-card text-t2 hover:bg-subtle disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            >
                                ‹
                            </button>
                            {Array.from(
                                { length: totalPages },
                                (_, i) => i + 1,
                            ).map((n) => (
                                <button
                                    key={n}
                                    onClick={() => setPage(n)}
                                    aria-label={`Page ${n}`}
                                    aria-current={
                                        safePage === n ? "page" : undefined
                                    }
                                    className={`w-7 h-7 rounded-md border text-xs flex items-center justify-center
                              transition-colors cursor-pointer
                              ${
                                  safePage === n
                                      ? "bg-[#185FA5] border-[#185FA5] text-white font-medium"
                                      : "border-border bg-card text-t2 hover:bg-subtle"
                              }`}
                                >
                                    {n}
                                </button>
                            ))}
                            <button
                                onClick={() =>
                                    setPage((p) => Math.min(p + 1, totalPages))
                                }
                                disabled={safePage === totalPages}
                                aria-label="Next page"
                                className="w-7 h-7 flex items-center justify-center rounded-md border border-border bg-card text-t2 hover:bg-subtle disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            >
                                ›
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
