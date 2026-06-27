import { Users } from "lucide-react";
import { Calendar } from "lucide-react";
import { ActivityIcon } from "lucide-react";
import { LogOut } from "lucide-react";
import { LayoutDashboard } from "lucide-react";
import { Link, Outlet } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

export const AdminSidebar = () => {
    const { logout } = useUser();
    return (
        <div className="flex w-full min-h-screen">
            <aside className="w-64 bg-card border-r border-border flex flex-col transition-colors duration-300">
                <div className="p-6 flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
                        C
                    </div>
                    <h1 className="text-2xl font-bold text-t1">Cliniq</h1>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    <Link
                        to="/admin/dashboard"
                        className="flex items-center gap-3 px-4 py-3 bg-subtle text-primary border-r-4 border-primary rounded-l-lg font-medium"
                    >
                        <LayoutDashboard size={20} /> Overview
                    </Link>
                    <Link
                        to="/admin/doctors"
                        className="flex items-center gap-3 px-4 py-3 bg-subtle text-primary border-r-4 border-primary rounded-l-lg font-medium"
                    >
                        <ActivityIcon size={20} /> Doctors
                    </Link>

                    <Link
                        to="/admin/patients"
                        className="flex items-center gap-3 px-4 py-3 bg-subtle text-primary border-r-4 border-primary rounded-l-lg font-medium"
                    >
                        <Users size={20} /> Patients
                    </Link>

                    <Link
                        to="/admin/bookings"
                        className="flex items-center gap-3 px-4 py-3 bg-subtle text-primary border-r-4 border-primary rounded-l-lg font-medium"
                    >
                        <Calendar size={20} /> Bookings
                    </Link>
                </nav>

                <div className="p-4 border-t border-border">
                    <button
                        onClick={() => logout()}
                        className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-lg font-medium w-full transition-colors"
                    >
                        <LogOut size={20} /> Logout
                    </button>
                </div>
            </aside>
            <Outlet />
        </div>
    );
};
