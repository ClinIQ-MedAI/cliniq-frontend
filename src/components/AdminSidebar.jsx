import {
    Users,
    Calendar,
    ActivityIcon,
    LogOut,
    LayoutDashboard,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

export const AdminSidebar = () => {
    const { logout } = useUser();

    const navLinkClasses = ({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 font-medium transition-colors ${
            isActive
                ? "bg-subtle text-primary border-r-4 border-primary rounded-l-lg"
                : "text-gray-500 hover:bg-subtle/50 hover:text-primary rounded-lg"
        }`;

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
                    <NavLink to="/admin/dashboard" className={navLinkClasses}>
                        <LayoutDashboard size={20} /> Overview
                    </NavLink>

                    <NavLink to="/admin/doctors" className={navLinkClasses}>
                        <ActivityIcon size={20} /> Doctors
                    </NavLink>

                    <NavLink to="/admin/patients" className={navLinkClasses}>
                        <Users size={20} /> Patients
                    </NavLink>

                    <NavLink to="/admin/bookings" className={navLinkClasses}>
                        <Calendar size={20} /> Bookings
                    </NavLink>
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
