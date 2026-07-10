import { useState, useEffect } from "react";
import { Users, ActivityIcon, UserPlus, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../apis/api";
import { AdminDashboardHeader } from "../components/AdminDashboardHeader";
import API_ENDPOINTS from "../apis/endpoints";

/* ─── skeleton for a single stat card ────────────────────────── */
const StatCardSkeleton = () => (
    <div className="bg-card/150 p-6 rounded-xl border border-border shadow-sm animate-pulse">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-subtle" />
            <div className="flex-1 space-y-2">
                <div className="h-3 w-24 rounded bg-subtle" />
                <div className="h-6 w-12 rounded bg-subtle" />
            </div>
        </div>
    </div>
);

/* ─── real stat card ──────────────────────────────────────────── */
const StatCard = ({ Icon, label, value }) => (
    <div className="bg-card p-6 rounded-xl border border-border shadow-sm transition-colors duration-300">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-lg">
                <Icon size={24} />
            </div>
            <div>
                <p className="text-sm text-t2 font-medium">{label}</p>
                <p className="text-2xl font-bold text-t1">{value}</p>
            </div>
        </div>
    </div>
);

export const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalDoctors: 0,
        totalPatients: 0,
        pendingDoctors: 0,
        unreadMessages: 0,
    });
    const [isLoadingStats, setIsLoadingStats] = useState(true);
    const [statsError, setStatsError] = useState("");

    useEffect(() => {
        async function fetchDashboardStats() {
            try {
                setIsLoadingStats(true);
                setStatsError("");
                const [doctorsRes, patientsRes, messagesRes] =
                    await Promise.all([
                        api.get(
                            API_ENDPOINTS.Admin.Doctor
                                .getListOfDoctorsOrCreateDoctor,
                        ),
                        api.get(
                            API_ENDPOINTS.Admin.Patient.getOrCreatePatients,
                        ),
                        api.get(API_ENDPOINTS.Admin.Contact.getAllMessages),
                    ]);

                const doctors = doctorsRes.data ?? [];
                const patients = patientsRes.data ?? [];
                // Response shape: { items: [...], totalCount }
                const messages = messagesRes.data?.items ?? [];
                setStats({
                    totalDoctors: doctors.length,
                    totalPatients: patients.length,
                    pendingDoctors: doctors.filter(
                        (d) => d.status === "PENDING_VERIFICATION",
                    ).length,
                    unreadMessages: messages.filter((m) => !m.isRead).length,
                });
            } catch (err) {
                setStatsError("Failed to load dashboard stats.");
            } finally {
                setIsLoadingStats(false);
            }
        }
        fetchDashboardStats();
    }, []);

    return (
        <div className="flex w-full bg-page font-sans transition-colors duration-300">
            <main className="flex-1 p-8 overflow-y-auto">
                <AdminDashboardHeader />

                {statsError && (
                    <div className="mb-6 text-sm text-red-600">
                        {statsError}
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {isLoadingStats ? (
                        <>
                            <StatCardSkeleton />
                            <StatCardSkeleton />
                            <StatCardSkeleton />
                            <StatCardSkeleton />
                        </>
                    ) : (
                        <>
                            <StatCard
                                Icon={ActivityIcon}
                                label="Total Doctors"
                                value={stats.totalDoctors}
                            />
                            <StatCard
                                Icon={Users}
                                label="Total Patients"
                                value={stats.totalPatients}
                            />
                            <StatCard
                                Icon={UserPlus}
                                label="Pending Approvals"
                                value={stats.pendingDoctors}
                            />
                            <StatCard
                                Icon={Mail}
                                label="Unread Messages"
                                value={stats.unreadMessages}
                            />
                        </>
                    )}
                </div>

                {/* Action Required CTA */}
                {isLoadingStats ? (
                    <div className="bg-card p-6 rounded-xl border border-border shadow-sm animate-pulse">
                        <div className="h-4 w-48 rounded bg-subtle mb-2" />
                        <div className="h-3 w-64 rounded bg-subtle" />
                    </div>
                ) : (
                    <Link
                        to="/admin/doctors"
                        className="flex items-center justify-between p-6 bg-card rounded-xl border border-border shadow-sm hover:bg-subtle transition-colors"
                    >
                        <div>
                            <h3 className="font-bold text-t1">
                                Action Required: Doctor Verifications
                            </h3>
                            <p className="text-sm text-t2 mt-1">
                                {stats.pendingDoctors === 0
                                    ? "No pending approvals at the moment."
                                    : `${stats.pendingDoctors} doctor${
                                          stats.pendingDoctors !== 1 ? "s" : ""
                                      } waiting for approval`}
                            </p>
                        </div>
                        <span className="text-primary text-sm font-medium whitespace-nowrap">
                            Review →
                        </span>
                    </Link>
                )}
            </main>
        </div>
    );
};
