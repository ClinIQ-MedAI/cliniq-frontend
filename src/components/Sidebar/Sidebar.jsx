import { NavLink, useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import "./Sidebar.css";
import { X } from "lucide-react";
import { LogOut } from "lucide-react";
import { Activity } from "lucide-react";
import logo from "/cliniq_logo_transparent.png";
const NAV_MAIN = [
    {
        to: "/doctor-dashboard",
        icon: "ti-layout-dashboard",
        label: "Dashboard",
    },
    {
        to: "/appointments",
        icon: "ti-calendar-event",
        label: "Appointments",
        badge: 3,
    },
    { to: "/tables", icon: "ti-table", label: "Tables" },
];

const NAV_CONTENT = [
    { to: "/articles", icon: "ti-article", label: "Articles" },
    { to: "/profile", icon: "ti-user-circle", label: "Profile" },
];

function NavItem({ to, icon, label, badge }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) => `sb-item${isActive ? " active" : ""}`}
        >
            <span className="sb-icon">
                <i className={`ti ${icon}`} aria-hidden="true" />
            </span>
            <span className="sb-label">{label}</span>
            {badge != null && <span className="sb-badge">{badge}</span>}
        </NavLink>
    );
}

function Sidebar({ isSidebarOpen, setIsSidebarOpen }) {
    const { user } = useUser();
    const navigate = useNavigate();
    const { logout } = useUser();
    const initials = (name = "") =>
        name
            .split(" ")
            .filter(Boolean)
            .map((p) => p[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

    return (
        <aside
            className={`sb fixed z-10 ${isSidebarOpen ? "translate-x-0" : "-translate-x-[100%]"} transition-all  md:translate-x-0 md:sticky left-0 top-0 `}
            aria-label="Main navigation "
        >
            {/* Logo */}
            <div className="sb-logo">
                <div className="sb-logo-mark ">
                    {/* <Activity className="text-white" size={16} /> */}
                    <img
                        src={logo}
                        alt=""
                        className=""
                        style={{ objectFit: "cover" }}
                    />
                </div>
                <div>
                    <div className="sb-logo-name">Cliniq</div>
                    <div className="sb-logo-sub">Doctor portal</div>
                </div>
                <div
                    className="text-red-500 ml-auto cursor-pointer hover:scale-120 active:scale-90 transition-all hover:bg-gray-300 rounded-md md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                >
                    <X />
                </div>
            </div>

            {/* Main nav */}
            <span className="sb-section-label">Main</span>
            <nav aria-label="Main">
                {NAV_MAIN.map((item) => (
                    <NavItem key={item.to} {...item} />
                ))}
            </nav>

            {/* Content nav */}
            <span className="sb-section-label">Content</span>
            <nav aria-label="Content">
                {NAV_CONTENT.map((item) => (
                    <NavItem key={item.to} {...item} />
                ))}
            </nav>

            {/* Footer — user + sign out */}
            <div className="sb-footer">
                <div className="sb-user">
                    <div className="sb-av">
                        {initials(user?.firstName + " " + user?.lastName)}
                    </div>
                    <div className="sb-user-info">
                        <div className="sb-user-name">
                            {user?.firstName} {user?.lastName ?? ""}
                        </div>
                        <div className="sb-user-role">Cardiologist</div>
                    </div>
                    <button
                        className="sb-signout"
                        aria-label="Sign out"
                        onClick={() => logout()}
                    >
                        <LogOut />
                    </button>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;
