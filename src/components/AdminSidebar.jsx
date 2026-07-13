import { useState } from "react";
import {
    Users,
    Calendar,
    ActivityIcon,
    LogOut,
    LayoutDashboard,
    MessageCircle,
    Menu,
    X,
    UserCog,
    Shield,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

const NAV_ITEMS = [
    {
        to: "/admin/dashboard",
        icon: LayoutDashboard,
        label: "Overview",
        permission: "Permissions.Dashboard.View",
    },
    {
        to: "/admin/doctors",
        icon: ActivityIcon,
        label: "Doctors",
        permission: "Permissions.Doctors.View",
    },
    {
        to: "/admin/patients",
        icon: Users,
        label: "Patients",
        permission: "Permissions.Patients.View",
    },
    {
        to: "/admin/bookings",
        icon: Calendar,
        label: "Bookings",
        permission: "Permissions.Bookings.View",
    },
    {
        to: "/admin/contact-us",
        icon: MessageCircle,
        label: "Contact Us",
        permission: "Permissions.Contacts.Manage",
    },
    {
        to: "/admin/admins",
        icon: UserCog,
        label: "Admins",
        permission: "Permissions.Admins.View",
    },
    {
        to: "/admin/roles",
        icon: Shield,
        label: "Roles",
        permission: "Permissions.Roles.View",
    },
];

export const AdminSidebar = () => {
    const { logout, hasPermission } = useUser();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const navLinkClasses = ({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 font-medium transition-colors ${
            isActive
                ? "bg-subtle text-primary border-r-4 border-primary rounded-l-lg"
                : "text-gray-500 hover:bg-subtle/50 hover:text-primary rounded-lg"
        }`;

    const closeMobileMenu = () => setIsMobileOpen(false);

    const visibleItems = NAV_ITEMS.filter((item) =>
        hasPermission(item.permission),
    );

    return (
        <div className="flex w-full min-h-screen">
            {/* Mobile top bar — only visible below md */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 bg-card border-b border-border">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
                        C
                    </div>
                    <h1 className="text-xl font-bold text-t1">Cliniq</h1>
                </div>
                <button
                    onClick={() => setIsMobileOpen(true)}
                    className="p-2 text-t2 hover:text-primary hover:bg-subtle rounded-lg transition-colors"
                    aria-label="Open menu"
                >
                    <Menu size={22} />
                </button>
            </div>

            {/* Backdrop for mobile drawer */}
            {isMobileOpen && (
                <div
                    className="md:hidden fixed inset-0 z-40 bg-black/50"
                    onClick={closeMobileMenu}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar: off-canvas drawer on mobile, static column on md+ */}
            <aside
                className={`w-64 bg-card border-r border-border flex flex-col transition-transform duration-300 ease-in-out
                fixed inset-y-0 left-0 z-50 md:static md:translate-x-0 md:z-auto
                ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
                <div className="p-6 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
                            C
                        </div>
                        <h1 className="text-2xl font-bold text-t1">Cliniq</h1>
                    </div>
                    <button
                        onClick={closeMobileMenu}
                        className="md:hidden p-1.5 text-t2 hover:text-primary hover:bg-subtle rounded-full transition-colors"
                        aria-label="Close menu"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
                    {visibleItems.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={navLinkClasses}
                            onClick={closeMobileMenu}
                        >
                            <Icon size={20} /> {label}
                        </NavLink>
                    ))}
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

            {/* Main content area — offset for the fixed mobile top bar */}
            <div className="flex-1 w-full min-w-0 pt-16 md:pt-0">
                <Outlet />
            </div>
        </div>
    );
};
