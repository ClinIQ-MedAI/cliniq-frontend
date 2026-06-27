import { useState, useEffect } from "react";
import { UserPlus, Check, X, Moon, Sun } from "lucide-react";
import api from "../apis/api";
import { AdminDashboardHeader } from "../components/AdminDashboardHeader";
import API_ENDPOINTS from "../apis/endpoints";

export const AdminDashboard = () => {
    const [pendingDoctors, setPendingDoctors] = useState([]);
    // Fetch pending doctors on load
    useEffect(() => {
        api.get(API_ENDPOINTS.getOrCreateDoctor).then((res) => {
            const pending = res.data.items.filter(
                (d) => d.status === "PENDING_VERIFICATION",
            );
            setPendingDoctors(pending);
        });
    }, []);

    const handleApprove = (id) => {
        api.post(API_ENDPOINTS.approveDoctor(id)).then(() => {
            setPendingDoctors(pendingDoctors.filter((d) => d.id !== id));
        });
    };

    return (
        <div className="flex w-full bg-page font-sans transition-colors duration-300">
            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 p-8 overflow-y-auto">
                {/* Header */}
                <AdminDashboardHeader />

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-card p-6 rounded-xl border border-border shadow-sm transition-colors duration-300">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 text-primary rounded-lg">
                                <UserPlus size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-t2 font-medium">
                                    Pending Approvals
                                </p>
                                <p className="text-2xl font-bold text-t1">
                                    {pendingDoctors.length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pending Doctors Table */}
                <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden transition-colors duration-300">
                    <div className="p-6 border-b border-border">
                        <h3 className="text-xl font-bold text-t1">
                            Action Required: Doctor Verifications
                        </h3>
                    </div>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-subtle text-t2 text-sm border-b border-border">
                                <th className="p-4 font-medium">Name</th>
                                <th className="p-4 font-medium">
                                    Specialization
                                </th>
                                <th className="p-4 font-medium">License #</th>
                                <th className="p-4 font-medium text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingDoctors.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="4"
                                        className="p-4 text-center text-t3 py-8"
                                    >
                                        No pending approvals at the moment.
                                    </td>
                                </tr>
                            ) : (
                                pendingDoctors.map((doc) => (
                                    <tr
                                        key={doc.id}
                                        className="border-b border-border-sub hover:bg-subtle transition-colors"
                                    >
                                        <td className="p-4 font-medium text-t1">
                                            Dr. {doc.firstName} {doc.lastName}
                                        </td>
                                        <td className="p-4 text-t2">
                                            {doc.specialization}
                                        </td>
                                        <td className="p-4 text-t2 font-mono text-sm">
                                            {doc.licenseNumber}
                                        </td>
                                        <td className="p-4 flex justify-end gap-2">
                                            <button
                                                onClick={() =>
                                                    handleApprove(doc.id)
                                                }
                                                className="flex items-center gap-1 bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1.5 rounded-lg hover:bg-green-500/20 transition"
                                            >
                                                <Check size={16} /> Approve
                                            </button>
                                            <button className="flex items-center gap-1 bg-red-500/10 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition">
                                                <X size={16} /> Reject
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};
