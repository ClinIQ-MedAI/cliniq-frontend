import React, { useState, useEffect, useRef, useMemo } from "react";
import { useUser } from "../../contexts/UserContext";
import "./Dashboard.css";
import { Users, Calendar, UserPlus, Clock, Loader2 } from "lucide-react";
import api from "../../apis/api";
import API_ENDPOINTS from "../../apis/endpoints";

/* ─── helpers ──────────────────────────────────────────────── */
const ini = (name = "") =>
    name
        .split(" ")
        .filter(Boolean)
        .map((p) => p[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
};

const todayISO = () => new Date().toISOString().split("T")[0];

const addDaysISO = (isoDate, days) => {
    const d = new Date(isoDate);
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
};

/* ─── metric card ───────────────────────────────────────────── */
const MetricCard = ({ Icon, label, value, sub, subUp }) => (
    <div className="db-mc">
        <div className="db-mc-label">
            <Icon />
            {label}
        </div>
        <div className="db-mc-num">{value}</div>
        {sub && (
            <div
                className={`db-mc-sub ${subUp ? "up" : subUp === false ? "dn" : ""}`}
            >
                {sub}
            </div>
        )}
    </div>
);

/* ─── weekly schedule strip ────────────────────────────────────── */
const STATUS_STYLES = {
    Available: "db-day-available",
    Full: "db-day-full",
    Closed: "db-day-closed",
};

const WeeklySchedule = ({ calendar, isLoading, error }) => {
    if (isLoading) {
        return (
            <div className="flex items-center gap-2 text-sm text-t2 py-4">
                <Loader2 size={15} className="animate-spin" />
                Loading schedule...
            </div>
        );
    }
    if (error) {
        return <div className="text-sm text-red-600 py-4">{error}</div>;
    }
    if (!calendar || calendar.length === 0) {
        return (
            <p className="text-sm text-t3 py-4">
                No schedule generated yet — set your availability and generate a
                range from the Availability page.
            </p>
        );
    }

    return (
        <div className="db-week-strip">
            {calendar.map((day) => (
                <div
                    key={day.date}
                    className={`db-day-card ${STATUS_STYLES[day.status] ?? "db-day-closed"}`}
                >
                    <div className="db-day-name">
                        {dayNameFromDate(day.date).slice(0, 3)}
                    </div>
                    <div className="db-day-date">
                        {new Date(day.date).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                        })}
                    </div>
                    <div className="db-day-count">{day.bookingCount}</div>
                    <div className="db-day-status">{deriveStatus(day)}</div>
                </div>
            ))}
        </div>
    );
};

/* ─── performance chart ─────────────────────────────────────────── */
// NOTE: no backend endpoint exists yet for this (no /dashboard/metrics
// in the OpenAPI spec). Keeping the fallback-only version until the
// backend adds something like GET /api/doctor/dashboard/metrics.
const PerformanceChart = ({ chartData }) => {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);
    useEffect(() => {
        const isDark = window.matchMedia(
            "(prefers-color-scheme: dark)",
        ).matches;
        const gridColor = isDark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.06)";
        const tickColor = isDark ? "#888" : "#94a3b8";

        if (!canvasRef.current || typeof window.Chart === "undefined") {
            return;
        }
        if (chartRef.current) {
            chartRef.current.destroy();
        }

        chartRef.current = new window.Chart(canvasRef.current, {
            type: "bar",
            data: {
                labels: chartData.months,
                datasets: [
                    {
                        label: "Completed",
                        data: chartData.completed,
                        backgroundColor: "#185FA5",
                        borderRadius: 4,
                        barPercentage: 0.5,
                    },
                    {
                        label: "Canceled/No-show",
                        data: chartData.canceled,
                        backgroundColor: "#f43f5e",
                        borderRadius: 4,
                        barPercentage: 0.5,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (c) => ` ${c.parsed.y} Appointments`,
                        },
                    },
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: tickColor, font: { size: 11 } },
                        border: { display: false },
                    },
                    y: {
                        grid: { color: gridColor },
                        ticks: { color: tickColor, font: { size: 11 } },
                        border: { display: false },
                    },
                },
            },
        });
        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
                chartRef.current = null;
            }
        };
    }, [chartData]);

    return (
        <div className="db-chart-block">
            <div className="db-legend">
                <span className="db-leg-item">
                    <span
                        className="db-leg-sq"
                        style={{ background: "#185FA5" }}
                    />
                    Completed
                </span>
                <span className="db-leg-item">
                    <span
                        className="db-leg-sq"
                        style={{ background: "#f43f5e" }}
                    />
                    Canceled
                </span>
            </div>
            <div className="db-chart-wrap">
                <canvas
                    ref={canvasRef}
                    role="img"
                    aria-label="Appointments chart"
                ></canvas>
            </div>
        </div>
    );
};

/* ─── notifications → smart alerts ───────────────────────────── */
const DOT_BY_TYPE = {
    BOOKING_CANCELLED: "hi",
    DOCTOR_JOIN_REQUEST: "hi",
    BOOKING_CREATED: "md",
    BOOKING_CONFIRMED: "md",
    PATIENT_NEW_REGISTRATION: "md",
    BOOKING_COMPLETED: "lo",
    CONTACT_US_MESSAGE: "lo",
    ADMIN_BROADCAST: "lo",
};
const timeAgo = (isoDate) => {
    const diffMs = Date.now() - new Date(isoDate).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
    const days = Math.floor(hrs / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
};

const SmartAlerts = ({ notifications, isLoading, error }) => {
    if (isLoading) {
        return (
            <div className="flex items-center gap-2 text-sm text-t2 py-4">
                <Loader2 size={15} className="animate-spin" />
                Loading alerts...
            </div>
        );
    }
    if (error) {
        return <div className="text-sm text-red-600 py-4">{error}</div>;
    }
    if (!notifications || notifications.length === 0) {
        return <p className="text-sm text-t3 py-4">No new alerts.</p>;
    }
    return (
        <>
            {notifications.map((n) => (
                <div key={n.id} className="db-ann-row">
                    <div
                        className={`db-ann-dot db-ann-dot-${DOT_BY_TYPE[n.type] ?? "lo"}`}
                    />
                    <div>
                        <div className="db-ann-text">{n.title ?? n.body}</div>
                        <div className="db-ann-date">
                            {timeAgo(n.createdAt)}
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
};
const dayNameFromDate = (iso) =>
    new Date(iso).toLocaleDateString(undefined, { weekday: "long" });

const deriveStatus = (day) => (day.isAvailable ? "Available" : "Closed");
/* ─── avatar colours cycling ────────────────────────────────── */
const AV_CLASSES = ["db-cl-a", "db-cl-b", "db-cl-c"];

/* ─── main dashboard ────────────────────────────────────────── */
export default function Dashboard() {
    const { user } = useUser();
    const [time, setTime] = useState(new Date());

    const [calendar, setCalendar] = useState([]);
    const [isLoadingSchedule, setIsLoadingSchedule] = useState(true);
    const [scheduleError, setScheduleError] = useState("");

    const [notifications, setNotifications] = useState([]);
    const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
    const [notificationsError, setNotificationsError] = useState("");
    const [recentBookings, setRecentBookings] = useState([]);
    const [isLoadingRecent, setIsLoadingRecent] = useState(true);
    const [performanceData, setPerformanceData] = useState({
        totalPatients: 0,
        totalPatientsChangePercent: 0,
        newPatientsThisMonth: 0,
        newPatientsChangePercent: 0,
        monthlyPerformance: [],
    });

    const chartData = useMemo(
        () => transformChartData(performanceData.monthlyPerformance),
        [performanceData.monthlyPerformance],
    );

    function transformChartData(rawData) {
        return {
            months: rawData?.map((d) => d.month),
            completed: rawData?.map((d) => d.completed),
            canceled: rawData?.map((d) => d.canceled),
        };
    }

    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    // Schedule: now hits GET /api/doctor/schedules?from=&to=
    // (doctor is resolved server-side from the JWT, no doctorId param needed)
    useEffect(() => {
        async function fetchWeeklySchedule() {
            try {
                setIsLoadingSchedule(true);
                setScheduleError("");
                const from = todayISO();
                const to = addDaysISO(from, 6);
                const res = await api.get(
                    API_ENDPOINTS.Doctor.getAllSchedules,
                    {
                        params: { from, to },
                    },
                );
                setCalendar(res.data ?? []);
            } catch (err) {
                setScheduleError(
                    err?.response?.data?.title ??
                        err?.response?.data?.message ??
                        "Failed to load schedule",
                );
            } finally {
                setIsLoadingSchedule(false);
            }
        }
        fetchWeeklySchedule();
    }, []);

    useEffect(() => {
        async function fetchPerformace() {
            const response = await api.get(
                API_ENDPOINTS.Doctor.getPerformanceData,
            );

            setPerformanceData(response.data);
        }
        fetchPerformace();
    }, []);

    // Smart Alerts: now hits GET /api/notifications
    useEffect(() => {
        async function fetchNotifications() {
            try {
                setIsLoadingNotifications(true);
                setNotificationsError("");
                const res = await api.get(API_ENDPOINTS.Notifications.getAll);
                setNotifications((res.data ?? []).slice(0, 5));
            } catch (err) {
                setNotificationsError(
                    err?.response?.data?.title ??
                        err?.response?.data?.message ??
                        "Failed to load alerts",
                );
            } finally {
                setIsLoadingNotifications(false);
            }
        }
        fetchNotifications();
    }, []);

    const today = todayISO();
    const todaysCount =
        calendar.find((d) => d.date === today)?.bookingCount ?? 0;

    useEffect(() => {
        async function fetchRecent() {
            try {
                setIsLoadingRecent(true);
                const res = await api.get(
                    API_ENDPOINTS.Doctor.getDoctorScheduleBookings,
                );
                const completed = (res.data ?? [])
                    .filter((b) => b.status === "COMPLETED")
                    .sort((a, b) => new Date(b.date) - new Date(a.date));

                setRecentBookings(completed.slice(0, 3));
            } catch {
                setRecentBookings([]);
            } finally {
                setIsLoadingRecent(false);
            }
        }
        fetchRecent();
    }, []);

    return (
        <div className="db-root">
            <title>Dashboard - ClinIQ</title>
            <div className="db-welcome">
                <div>
                    <h1 className="db-welcome-name">
                        {getGreeting()}, {user?.user?.firstName}{" "}
                        {user?.user?.lastName}
                    </h1>
                    <p className="db-welcome-sub">
                        Overview of appointments, patients, and alerts
                    </p>
                </div>
                <div className="db-clock">
                    <div className="db-clock-time">
                        {time.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </div>
                    <div className="db-clock-date">
                        {time.toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                        })}
                    </div>
                </div>
            </div>

            {/* metric cards */}
            <div className="db-metrics">
                <MetricCard
                    Icon={Users}
                    label="Total Patients"
                    value={performanceData.totalPatients}
                    sub={performanceData.totalPatientsChangePercent + "%"}
                    subUp={true}
                />
                <MetricCard
                    Icon={Calendar}
                    label="Today's Appointments"
                    value={isLoadingSchedule ? "—" : todaysCount}
                />
                <MetricCard
                    Icon={UserPlus}
                    label="New Patients This Month"
                    value={performanceData.newPatientsThisMonth}
                    sub={performanceData.newPatientsChangePercent + "%"}
                    subUp={true}
                />
                <MetricCard
                    Icon={Clock}
                    label="Avg. Consultation Time"
                    value="18 mins"
                    sub="Optimal efficiency"
                    subUp={true}
                />
            </div>

            <div className="db-grid">
                <div className="db-left">
                    <div className="db-card">
                        <div className="db-card-title">
                            This week's schedule
                        </div>
                        <WeeklySchedule
                            calendar={calendar}
                            isLoading={isLoadingSchedule}
                            error={scheduleError}
                        />
                    </div>

                    <div className="db-card text-center">
                        <div className="db-card-title">
                            Appointments Performance (6 Months)
                        </div>
                        <PerformanceChart chartData={chartData} />
                    </div>
                </div>

                <aside className="db-right">
                    <div className="db-card">
                        <div className="db-card-title">
                            Recent Consultations
                        </div>
                        {recentBookings.map((p, i) => (
                            <div key={p.id} className="db-client-row">
                                <div
                                    className={`db-cl-av ${AV_CLASSES[i % AV_CLASSES.length]}`}
                                >
                                    {ini(p.patientName)}
                                </div>
                                <div className="db-cl-info">
                                    <div className="db-cl-name">
                                        {p.patientName}
                                    </div>
                                    <div className="db-cl-cond">{p.date}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="db-card">
                        <div className="db-card-title">Smart Alerts</div>
                        <SmartAlerts
                            notifications={notifications}
                            isLoading={isLoadingNotifications}
                            error={notificationsError}
                        />
                    </div>
                </aside>
            </div>
        </div>
    );
}
