import React, { useState, useEffect, useRef } from "react";
import { useUser } from "../../contexts/UserContext";
import { patientsData } from "../../Services/mockData";
import "./Dashboard.css";
import { Users, Calendar, TrendingUp, Star } from "lucide-react";
import { Check } from "lucide-react";
import { X } from "lucide-react";
import api from "../../apis/api";
import toast from "react-hot-toast";
import API_ENDPOINTS from "../../apis/endpoints";
import { Loader2 } from "lucide-react";

/* ─── helpers ──────────────────────────────────────────────── */
const ini = (name = "") =>
    name
        .split(" ")
        .filter(Boolean)
        .map((p) => p[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

const fmt = (n) =>
    new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(n);

const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
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

/* ─── status pill ───────────────────────────────────────────── */
const STATUS_CLASS = {
    pending: "db-pill-pending",
    approved: "db-pill-approved",
    rejected: "db-pill-rejected",
};

const StatusPill = ({ status }) => (
    <span className={`db-pill ${STATUS_CLASS[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
);

/* ─── appointments table ────────────────────────────────────── */
const AppointmentsTable = () => {
    const [pendingAppointments, setPendingAppointments] = useState([]);
    useEffect(() => {
        api.get(API_ENDPOINTS.getPendingAppointments)
            .then((response) => setPendingAppointments(response.data))
            .catch((err) => console.log(err));
    }, []);
    const toggle = (id, next) => {
        const appointmentIndex = pendingAppointments.findIndex(
            (p) => p.id === id,
        );
        if (appointmentIndex !== -1) {
            api.patch(API_ENDPOINTS.updateAppointmentStatus(id), {
                status: next,
            })
                .then(() => {
                    pendingAppointments.splice(appointmentIndex, 1);
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    };

    return (
        <div className="overflow-x-auto w-full max-w-[100%]">
            <table className="db-table">
                <thead>
                    <tr>
                        <th>Patient</th>
                        <th>Condition</th>
                        <th>Date</th>
                        <th style={{ textAlign: "center" }}>Status</th>
                        <th style={{ textAlign: "center" }}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {pendingAppointments.map((r) => (
                        <tr key={r.id}>
                            <td>
                                <div className="db-name-cell">
                                    <div className="db-av">{ini(r.name)}</div>
                                    <span>{r.name}</span>
                                </div>
                            </td>
                            <td className="db-muted">{r.disease}</td>
                            <td className="db-muted">{r.date}</td>
                            <td style={{ textAlign: "center" }}>
                                <StatusPill status={r.status} />
                            </td>
                            <td style={{ textAlign: "center" }}>
                                <div className="db-action-btns">
                                    <button
                                        className={`db-abt ${r.status === "approved" ? "db-abt-ok" : ""}`}
                                        onClick={() => toggle(r.id, "approved")}
                                        aria-label={`Approve ${r.name}`}
                                    >
                                        <span
                                            style={{
                                                display: "flex",
                                                width: 14,
                                                height: 14,
                                            }}
                                        >
                                            <Check size={14} />
                                        </span>
                                    </button>
                                    <button
                                        className={`db-abt ${r.status === "rejected" ? "db-abt-rej" : ""}`}
                                        onClick={() => toggle(r.id, "rejected")}
                                        aria-label={`Reject ${r.name}`}
                                    >
                                        <span
                                            style={{
                                                display: "flex",
                                                width: 14,
                                                height: 14,
                                            }}
                                        >
                                            <X size={14} />
                                        </span>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

/* ─── revenue chart ─────────────────────────────────────────── */
const RevenueChart = () => {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);
    const [isLoadingChartData, setIsLoadingChartData] = useState(true);
    const [chartData, setChartData] = useState(null);
    useEffect(() => {
        async function GetDashboardMetricesData() {
            try {
                setIsLoadingChartData(true);

                const response = await api.get(
                    API_ENDPOINTS.getDashboardMetrices,
                );
                setChartData(response.data?.chartData);
            } catch (error) {
                console.log(error);
            } finally {
                setIsLoadingChartData(false);
            }
        }
        GetDashboardMetricesData();
    }, []);

    useEffect(() => {
        const isDark = window.matchMedia(
            "(prefers-color-scheme: dark)",
        ).matches;
        const gridColor = isDark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.06)";
        const tickColor = isDark ? "#888" : "#94a3b8";

        if (
            isLoadingChartData ||
            !chartData ||
            !canvasRef.current ||
            typeof window.Chart === "undefined"
        ) {
            return;
        }
        if (chartRef.current) {
            chartRef.current.destroy();
        }

        chartRef.current = new window.Chart(canvasRef.current, {
            type: "bar",
            data: {
                labels: chartData?.months || [],
                datasets: [
                    {
                        label: "Total revenue",
                        data: chartData?.revenue || [],
                        backgroundColor: "#185FA5",
                        borderRadius: 4,
                        barPercentage: 0.5,
                    },
                    {
                        label: "Consultations",
                        data: chartData?.consultations || [],
                        backgroundColor: "#9FE1CB",
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
                        callbacks: { label: (c) => fmt(c.parsed.y) },
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
                        ticks: {
                            color: tickColor,
                            font: { size: 11 },
                            callback: (v) => "$" + v / 1000 + "k",
                        },
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
    }, [chartData, isLoadingChartData]);

    if (isLoadingChartData) {
        return (
            <div className="flex justify-center gap-4">
                <Loader2 className="animate-spin" />
                <div>Loading Chart Data...</div>
            </div>
        );
    }
    return (
        <div
            className="db-chart-block"
            style={{ display: isLoadingChartData ? "none" : "" }}
        >
            <div className="db-legend">
                <span className="db-leg-item">
                    <span
                        className="db-leg-sq"
                        style={{ background: "#185FA5" }}
                    />
                    Total revenue
                </span>
                <span className="db-leg-item">
                    <span
                        className="db-leg-sq"
                        style={{ background: "#9FE1CB" }}
                    />
                    Consultations
                </span>
            </div>
            <div className="db-chart-wrap">
                <canvas
                    ref={canvasRef}
                    role="img"
                    aria-label="Monthly revenue bar chart January to June 2024, peaking at $24,580 in May"
                >
                    Monthly revenue trend Jan–Jun 2024.
                </canvas>
            </div>
        </div>
    );
};

/* ─── avatar colours cycling ────────────────────────────────── */
const AV_CLASSES = ["db-cl-a", "db-cl-b", "db-cl-c"];

/* ─── main dashboard ────────────────────────────────────────── */
export default function Dashboard() {
    const { user } = useUser();
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    const clients = patientsData.slice(0, 3);

    const announcements = [
        {
            text: "Meeting rescheduled to 28 May, Conference Room A",
            date: "Jan 15",
            dot: "hi",
        },
        {
            text: "Doctors requested to update patient records by end of week",
            date: "Jan 14",
            dot: "md",
        },
        {
            text: "Dr. Faisal completed 400 surgeries — congratulations!",
            date: "Jan 13",
            dot: "lo",
        },
    ];
    return (
        <div className="db-root">
            {/* welcome */}
            <title>Dashboard - ClinIQ</title>
            <div className="db-welcome">
                <div>
                    <h1 className="db-welcome-name">
                        {getGreeting()},{" "}
                        {`${user?.firstName} ${user?.lastName}`}
                    </h1>
                    <p className="db-welcome-sub">
                        Overview of appointments, patients and announcements
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
                    label="Patients treated"
                    value="3,247"
                    sub="↑ 12% vs last month"
                    subUp={true}
                />
                <MetricCard
                    Icon={Calendar}
                    label="Today's appointments"
                    value="18"
                    sub="↑ 3 more than yesterday"
                    subUp={true}
                />
                <MetricCard
                    Icon={TrendingUp}
                    label="Monthly revenue"
                    value="$24,580"
                    sub="↑ 15% vs last month"
                    subUp={true}
                />
                <MetricCard
                    Icon={Star}
                    label="Average rating"
                    value="4.8"
                    sub="Based on 324 reviews"
                />
            </div>

            {/* main grid */}
            <div className="db-grid">
                {/* left column */}
                <div className="db-left">
                    <div className="db-card">
                        <div className="db-card-title">
                            Appointment requests
                        </div>
                        <AppointmentsTable />
                    </div>

                    <div className="db-card text-center">
                        <div className="db-card-title">Monthly revenue</div>

                        <RevenueChart />
                    </div>
                </div>

                {/* right column */}
                <aside className="db-right">
                    <div className="db-card">
                        <div className="db-card-title">
                            Most visited clients
                        </div>
                        {clients.map((p, i) => (
                            <div key={p.id} className="db-client-row">
                                <div
                                    className={`db-cl-av ${AV_CLASSES[i % AV_CLASSES.length]}`}
                                >
                                    {ini(p.name)}
                                </div>
                                <div className="db-cl-info">
                                    <div className="db-cl-name">{p.name}</div>
                                    <div className="db-cl-cond">
                                        {p.condition || "General"}
                                    </div>
                                </div>
                                <div className="db-cl-visits">
                                    {p.visits ?? 0}× visits
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="db-card">
                        <div className="db-card-title">Announcements</div>
                        {announcements.map((a, i) => (
                            <div key={i} className="db-ann-row">
                                <div
                                    className={`db-ann-dot db-ann-dot-${a.dot}`}
                                />
                                <div>
                                    <div className="db-ann-text">{a.text}</div>
                                    <div className="db-ann-date">{a.date}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>
            </div>
        </div>
    );
}
