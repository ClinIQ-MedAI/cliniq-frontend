import React, { useState, useEffect, useMemo } from "react";
import { Search, Frown, ChevronRight } from "lucide-react";
import API_ENDPOINTS from "../apis/endpoints";
import api from "../apis/api";
import { useNavigate } from "react-router-dom";

const ini = (name = "") =>
    name
        .split(" ")
        .filter(Boolean)
        .map((p) => p[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

const PER_PAGE = 8;

function formatDate(value) {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

/* ---------- mobile card ---------- */
function PatientCard({ patient, onOpen }) {
    return (
        <button
            onClick={onOpen}
            className="w-full text-left px-4 py-3 border-b border-border-sub last:border-none hover:bg-subtle transition-colors flex items-center gap-3"
        >
            <div className="w-9 h-9 rounded-full bg-[#E6F1FB] text-[#0C447C] flex items-center justify-center text-xs font-medium shrink-0">
                {ini(patient.patientName)}
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-sm text-t1 font-medium truncate">
                    {patient.patientName ?? "—"}
                </div>
                <div className="text-xs text-t3 truncate mt-0.5">
                    {patient.patientEmail ?? "—"}
                </div>
                <div className="flex items-center gap-2 text-xs text-t3 mt-1">
                    <span>Last visit: {formatDate(patient.lastVisit)}</span>
                    <span>·</span>
                    <span>
                        {patient.bookingCount} booking
                        {patient.bookingCount === 1 ? "" : "s"}
                    </span>
                </div>
            </div>
            <ChevronRight size={16} className="text-t3 shrink-0" />
        </button>
    );
}

export default function Patients() {
    const [bookings, setBookings] = useState([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        async function getMyBookings() {
            try {
                setIsLoading(true);
                setLoadError("");

                // There's no dedicated "list my patients" endpoint on the
                // backend today. We reuse the same bookings endpoint
                // AppointmentsPage calls (GET /api/doctor/schedules/bookings)
                // and derive the patient list from it below, since every
                // booking already carries patientId/patientName/etc.
                // NOTE: this means a patient only shows up here if they have
                // at least one booking with this doctor. If a proper
                // GET /api/doctor/patients endpoint is added later, swap the
                // call below and drop the dedup step.
                const response = await api.get(
                    API_ENDPOINTS.Doctor.getDoctorScheduleBookings,
                );
                setBookings(response.data ?? []);
            } catch (err) {
                setLoadError(
                    err?.response?.data?.title ??
                        err?.response?.data?.message ??
                        "Failed to load patients",
                );
            } finally {
                setIsLoading(false);
            }
        }
        getMyBookings();
    }, []);

    useEffect(() => {
        setPage(1);
    }, [search]);

    // Collapse bookings down to one row per patient. Keeps the most recent
    // booking's date as "last visit" and counts total bookings with this
    // doctor.
    const patients = useMemo(() => {
        const byId = new Map();
        for (const b of bookings) {
            const existing = byId.get(b.patientId);
            if (!existing) {
                byId.set(b.patientId, {
                    patientId: b.patientId,
                    patientName: b.patientName,
                    patientEmail: b.patientEmail,
                    patientPhone: b.patientPhone,
                    lastVisit: b.date,
                    bookingCount: 1,
                });
            } else {
                existing.bookingCount += 1;
                if (
                    b.date &&
                    (!existing.lastVisit || b.date > existing.lastVisit)
                ) {
                    existing.lastVisit = b.date;
                }
            }
        }
        return Array.from(byId.values()).sort((a, b) =>
            (a.patientName ?? "").localeCompare(b.patientName ?? ""),
        );
    }, [bookings]);

    const filtered = patients.filter((p) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            p.patientName?.toLowerCase().includes(q) ||
            p.patientEmail?.toLowerCase().includes(q)
        );
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    const safePage = Math.min(page, totalPages);
    const slice = filtered.slice(
        (safePage - 1) * PER_PAGE,
        safePage * PER_PAGE,
    );
    const start = filtered.length ? (safePage - 1) * PER_PAGE + 1 : 0;
    const end = Math.min(safePage * PER_PAGE, filtered.length);

    return (
        <div className="flex flex-col gap-5 pb-8 px-4 sm:px-5 pt-3">
            <title>Patients - ClinIQ</title>
            <div>
                <h1 className="text-lg sm:text-xl font-medium text-t1">
                    Patients
                </h1>
                <p className="text-sm text-t2 mt-1">
                    Everyone who has booked an appointment with you
                </p>
            </div>

            <div className="relative w-full sm:max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                    type="text"
                    placeholder="Search by name or email…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-card text-t1 placeholder:text-t3 focus:outline-none focus:border-[#185FA5] transition-colors"
                />
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
                {isLoading ? (
                    <div className="py-10 text-center text-sm text-t2">
                        Loading patients...
                    </div>
                ) : loadError ? (
                    <div className="py-10 text-center text-sm text-red-600">
                        {loadError}
                    </div>
                ) : slice.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-10 text-t2 text-sm px-4 text-center">
                        <Frown className="w-7 h-7" />
                        <p>
                            {search
                                ? "No patients match your search."
                                : "No patients yet. They'll show up here after their first booking with you."}
                        </p>
                        {search && (
                            <button
                                onClick={() => setSearch("")}
                                className="mt-1 px-4 py-1.5 rounded-lg border border-slate-200 text-slate-600
                         text-sm hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                                Clear search
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Mobile: stacked cards */}
                        <div className="md:hidden">
                            {slice.map((p) => (
                                <PatientCard
                                    key={p.patientId}
                                    patient={p}
                                    onOpen={() =>
                                        navigate(
                                            `/patients/${p.patientId}/documents`,
                                        )
                                    }
                                />
                            ))}
                        </div>

                        {/* Desktop / tablet: table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm border-collapse table-fixed min-w-[640px]">
                                <colgroup>
                                    <col className="w-[30%]" />
                                    <col className="w-[26%]" />
                                    <col className="w-[16%]" />
                                    <col className="w-[14%]" />
                                    <col className="w-[14%]" />
                                </colgroup>
                                <thead>
                                    <tr className="bg-subtle border-b border-border-sub">
                                        {[
                                            "Patient",
                                            "Contact",
                                            "Last visit",
                                            "Bookings",
                                            "Actions",
                                        ].map((h) => (
                                            <th
                                                key={h}
                                                className="text-[11px] font-medium text-t3 px-3.5 py-2.5 text-left"
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {slice.map((p) => (
                                        <tr
                                            key={p.patientId}
                                            className="border-b border-border-sub last:border-none hover:bg-subtle transition-colors"
                                        >
                                            <td className="px-3.5 py-2.5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-[#E6F1FB] text-[#0C447C] flex items-center justify-center text-[11px] font-medium shrink-0">
                                                        {ini(p.patientName)}
                                                    </div>
                                                    <span className="text-t1">
                                                        {p.patientName ?? "—"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-3.5 py-2.5 text-t2">
                                                <div className="flex flex-col">
                                                    <span className="truncate">
                                                        {p.patientEmail ?? "—"}
                                                    </span>
                                                    {p.patientPhone && (
                                                        <span className="text-t3 text-xs">
                                                            {p.patientPhone}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-3.5 py-2.5 text-t2">
                                                {formatDate(p.lastVisit)}
                                            </td>
                                            <td className="px-3.5 py-2.5 text-t2">
                                                {p.bookingCount}
                                            </td>
                                            <td className="px-3.5 py-2.5">
                                                <button
                                                    onClick={() =>
                                                        navigate(
                                                            `/patients/${p.patientId}/documents`,
                                                        )
                                                    }
                                                    className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-[#EEF3FB] text-[#185FA5] hover:bg-[#DCE9F7] transition-colors cursor-pointer"
                                                >
                                                    Documents
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {!isLoading && !loadError && filtered.length > 0 && (
                    <div className="flex items-center justify-between px-3.5 py-2.5 border-t border-border-sub flex-wrap gap-2">
                        <span className="text-xs text-t3">
                            Showing {start}–{end} of {filtered.length}
                        </span>
                        <div className="flex items-center gap-1 flex-wrap">
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
