import React, { useEffect, useState } from "react";
import {
    CalendarClock,
    Clock,
    Save,
    CalendarPlus,
    CheckCircle2,
    AlertCircle,
    Loader2,
    CalendarDays,
} from "lucide-react";
import api from "../apis/api";
import API_ENDPOINTS from "../apis/endpoints";

const DAYS = [
    { value: 0, label: "Sunday", short: "Sun" },
    { value: 1, label: "Monday", short: "Mon" },
    { value: 2, label: "Tuesday", short: "Tue" },
    { value: 3, label: "Wednesday", short: "Wed" },
    { value: 4, label: "Thursday", short: "Thu" },
    { value: 5, label: "Friday", short: "Fri" },
    { value: 6, label: "Saturday", short: "Sat" },
];

const DEFAULT_START = "09:00";
const DEFAULT_END = "17:00";

const todayISO = () => new Date().toISOString().split("T")[0];
const addDaysISO = (n) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d.toISOString().split("T")[0];
};

const getErrorMessage = (err, fallback) =>
    err?.response?.data?.title ?? err?.response?.data?.message ?? fallback;

export default function AvailabilityPage() {
    // ---------- Weekly recurring availability ----------
    const [days, setDays] = useState(() =>
        DAYS.map((d) => ({
            ...d,
            enabled: false,
            startTime: DEFAULT_START,
            endTime: DEFAULT_END,
            maxBookings: 10,
        })),
    );
    const [savingAvailability, setSavingAvailability] = useState(false);
    const [saveError, setSaveError] = useState("");
    const [saveSuccess, setSaveSuccess] = useState(false);

    // ---------- Generate schedule for a date range ----------
    const [range, setRange] = useState({
        startDate: todayISO(),
        endDate: addDaysISO(30),
    });
    const [generating, setGenerating] = useState(false);
    const [generateError, setGenerateError] = useState("");
    const [generateSuccess, setGenerateSuccess] = useState(false);

    // ---------- Upcoming generated schedule ----------
    const [schedule, setSchedule] = useState([]);
    const [loadingSchedule, setLoadingSchedule] = useState(true);
    const [scheduleError, setScheduleError] = useState("");

    const fetchSchedule = async () => {
        try {
            setLoadingSchedule(true);
            setScheduleError("");
            const res = await api.get(API_ENDPOINTS.Doctor.getAllSchedules, {
                params: { from: todayISO() },
            });
            setSchedule(res.data ?? []);
        } catch (err) {
            setScheduleError(getErrorMessage(err, "Failed to load schedule"));
        } finally {
            setLoadingSchedule(false);
        }
    };

    useEffect(() => {
        fetchSchedule();
    }, []);

    const toggleDay = (value) => {
        setDays((prev) =>
            prev.map((d) =>
                d.value === value ? { ...d, enabled: !d.enabled } : d,
            ),
        );
    };

    const updateDayField = (value, field, val) => {
        setDays((prev) =>
            prev.map((d) => (d.value === value ? { ...d, [field]: val } : d)),
        );
    };

    const handleSaveAvailability = async () => {
        setSaveError("");
        setSaveSuccess(false);

        const enabledDays = days.filter((d) => d.enabled);
        if (enabledDays.length === 0) {
            setSaveError("Select at least one day you're available.");
            return;
        }
        for (const d of enabledDays) {
            if (d.startTime >= d.endTime) {
                setSaveError(`${d.label}: start time must be before end time.`);
                return;
            }
        }

        const availabilities = enabledDays.map((d) => ({
            dayOfWeek: d.value,
            startTime: `${d.startTime}:00`,
            endTime: `${d.endTime}:00`,
            maxBookings: d.maxBookings,
        }));

        try {
            setSavingAvailability(true);
            await api.post(API_ENDPOINTS.Doctor.determineDoctorAvailability, {
                availabilities,
            });
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            setSaveError(getErrorMessage(err, "Failed to save availability"));
        } finally {
            setSavingAvailability(false);
        }
    };

    const handleGenerate = async () => {
        setGenerateError("");
        setGenerateSuccess(false);

        if (range.startDate > range.endDate) {
            setGenerateError("Start date must be before end date.");
            return;
        }

        try {
            setGenerating(true);
            await api.post(
                `${API_ENDPOINTS.Doctor.generateSchedule}?startDate=${range.startDate}&endDate=${range.endDate}`,
            );
            setGenerateSuccess(true);
            setTimeout(() => setGenerateSuccess(false), 3000);
            fetchSchedule();
        } catch (err) {
            setGenerateError(
                getErrorMessage(err, "Failed to generate schedule"),
            );
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="w-full bg-page p-4 md:p-6">
            <title>Availability - ClinIQ</title>

            <div className="max-w-6xl mx-auto space-y-6">
                {/* Page header */}
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-t1 flex items-center gap-2">
                        <CalendarClock size={22} style={{ color: "#185FA5" }} />
                        Availability & Schedule
                    </h1>
                </div>

                {/* ── Card 1: Weekly recurring availability ── */}
                <div className="bg-card rounded-2xl shadow-sm border border-border p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Clock size={16} style={{ color: "#185FA5" }} />
                        <h3 className="text-xs font-bold uppercase tracking-widest text-t3">
                            Weekly Availability
                        </h3>
                    </div>

                    {/* عرض الأيام في شبكة (Grid) من عمودين */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {days.map((d) => (
                            <div
                                key={d.value}
                                className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                                    d.enabled
                                        ? "border-[#185FA5]/30 bg-blue-50/50"
                                        : "border-border bg-subtle"
                                }`}
                            >
                                <button
                                    type="button"
                                    onClick={() => toggleDay(d.value)}
                                    className={`relative w-10 h-5 rounded-full flex-shrink-0 transition-colors ${
                                        d.enabled
                                            ? "bg-[#185FA5]"
                                            : "bg-slate-300"
                                    }`}
                                >
                                    <span
                                        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                                            d.enabled
                                                ? "translate-x-5"
                                                : "translate-x-0"
                                        }`}
                                    />
                                </button>

                                <span
                                    className={`w-20 text-sm font-semibold ${d.enabled ? "text-t1" : "text-t3"}`}
                                >
                                    {d.short}
                                </span>

                                {d.enabled ? (
                                    <div className="flex flex-1 flex-wrap lg:flex-nowrap items-center gap-1.5 justify-end">
                                        <input
                                            type="time"
                                            value={d.startTime}
                                            onChange={(e) =>
                                                updateDayField(
                                                    d.value,
                                                    "startTime",
                                                    e.target.value,
                                                )
                                            }
                                            className="px-2 py-1 rounded-lg border border-border text-xs text-t1 bg-card focus:border-blue-400 focus:outline-none"
                                        />
                                        <span className="text-t3 text-xs">
                                            -
                                        </span>
                                        <input
                                            type="time"
                                            value={d.endTime}
                                            onChange={(e) =>
                                                updateDayField(
                                                    d.value,
                                                    "endTime",
                                                    e.target.value,
                                                )
                                            }
                                            className="px-2 py-1 rounded-lg border border-border text-xs text-t1 bg-card focus:border-blue-400 focus:outline-none"
                                        />
                                        <div className="flex items-center gap-1 border-l border-border pl-1.5 ml-1">
                                            <span className="text-t3 text-[10px] uppercase">
                                                Max
                                            </span>
                                            <input
                                                type="number"
                                                min="1"
                                                value={d.maxBookings}
                                                onChange={(e) =>
                                                    updateDayField(
                                                        d.value,
                                                        "maxBookings",
                                                        parseInt(
                                                            e.target.value,
                                                        ) || 1,
                                                    )
                                                }
                                                className="w-12 px-1.5 py-1 rounded-lg border border-border text-xs text-t1 bg-card focus:border-blue-400 focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <span className="text-xs text-t3 ml-auto">
                                        Off
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>

                    {saveError && (
                        <div className="flex items-center gap-2 text-sm text-red-600 mt-3">
                            <AlertCircle size={15} /> {saveError}
                        </div>
                    )}
                    {saveSuccess && (
                        <div className="flex items-center gap-2 text-sm text-emerald-600 mt-3">
                            <CheckCircle2 size={15} /> Saved successfully.
                        </div>
                    )}

                    <button
                        onClick={handleSaveAvailability}
                        disabled={savingAvailability}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60 disabled:hover:translate-y-0 mt-4"
                        style={{ background: "#185FA5" }}
                    >
                        {savingAvailability ? (
                            <Loader2 size={15} className="animate-spin" />
                        ) : (
                            <Save size={15} />
                        )}
                        Save Availability
                    </button>
                </div>

                {/* ── Grid Layout for Card 2 & 3 ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* ── Card 2: Generate schedule ── */}
                    <div className="bg-card rounded-2xl shadow-sm border border-border p-5 h-fit">
                        <div className="flex items-center gap-2 mb-3">
                            <CalendarPlus
                                size={16}
                                style={{ color: "#185FA5" }}
                            />
                            <h3 className="text-xs font-bold uppercase tracking-widest text-t3">
                                Generate Slots
                            </h3>
                        </div>
                        <p className="text-xs text-t2 mb-4 leading-relaxed">
                            Select a date range to generate bookable slots based
                            on your saved availability above.
                        </p>

                        <div className="space-y-3">
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <p className="text-[10px] font-semibold uppercase text-t3 mb-1">
                                        Start Date
                                    </p>
                                    <input
                                        type="date"
                                        value={range.startDate}
                                        onChange={(e) =>
                                            setRange((r) => ({
                                                ...r,
                                                startDate: e.target.value,
                                            }))
                                        }
                                        className="w-full px-3 py-2 rounded-xl border border-border text-sm text-t1 bg-card focus:border-blue-400 focus:outline-none"
                                    />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-semibold uppercase text-t3 mb-1">
                                        End Date
                                    </p>
                                    <input
                                        type="date"
                                        value={range.endDate}
                                        onChange={(e) =>
                                            setRange((r) => ({
                                                ...r,
                                                endDate: e.target.value,
                                            }))
                                        }
                                        className="w-full px-3 py-2 rounded-xl border border-border text-sm text-t1 bg-card focus:border-blue-400 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleGenerate}
                                disabled={generating}
                                className="w-full flex justify-center items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-md disabled:opacity-60"
                                style={{ background: "#185FA5" }}
                            >
                                {generating ? (
                                    <Loader2
                                        size={15}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <CalendarPlus size={15} />
                                )}
                                Generate Now
                            </button>
                        </div>

                        {generateError && (
                            <div className="text-xs text-red-600 mt-3">
                                {generateError}
                            </div>
                        )}
                        {generateSuccess && (
                            <div className="text-xs text-emerald-600 mt-3">
                                Generated successfully!
                            </div>
                        )}
                    </div>

                    {/* ── Card 3: Upcoming generated schedule ── */}
                    <div className="bg-card rounded-2xl shadow-sm border border-border p-5 h-fit flex flex-col">
                        <div className="flex items-center gap-2 mb-4">
                            <CalendarDays
                                size={16}
                                style={{ color: "#185FA5" }}
                            />
                            <h3 className="text-xs font-bold uppercase tracking-widest text-t3">
                                Upcoming Schedule
                            </h3>
                        </div>

                        {/* سكرول داخلي للجدول عشان الشاشة متطولش */}
                        <div className="flex-1 max-h-[220px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                            {loadingSchedule ? (
                                <div className="flex items-center gap-2 text-xs text-t2 py-2">
                                    <Loader2
                                        size={14}
                                        className="animate-spin"
                                    />{" "}
                                    Loading...
                                </div>
                            ) : scheduleError ? (
                                <div className="text-xs text-red-600 py-2">
                                    {scheduleError}
                                </div>
                            ) : schedule.length === 0 ? (
                                <p className="text-xs text-t3 py-2">
                                    No slots generated yet.
                                </p>
                            ) : (
                                schedule.map((s) => (
                                    <div
                                        key={s.id}
                                        className="flex items-center justify-between px-3 py-2 rounded-lg bg-subtle border border-border"
                                    >
                                        <span className="text-xs font-medium text-t1">
                                            {new Date(
                                                s.date,
                                            ).toLocaleDateString(undefined, {
                                                weekday: "short",
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-t2">
                                                {s.bookingCount ?? 0} bookings
                                            </span>
                                            <span
                                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                                    s.isAvailable
                                                        ? "bg-emerald-100 text-emerald-700"
                                                        : "bg-slate-200 text-slate-600"
                                                }`}
                                            >
                                                {s.isAvailable
                                                    ? "Available"
                                                    : "Full"}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
