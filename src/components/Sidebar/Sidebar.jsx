import { NavLink, useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import "./Sidebar.css";

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

function Sidebar() {
    const { user } = useUser();
    const navigate = useNavigate();

    const initials = (name = "") =>
        name
            .split(" ")
            .filter(Boolean)
            .map((p) => p[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

    return (
        <aside className="sb" aria-label="Main navigation">
            {/* Logo */}
            <div className="sb-logo">
                <div className="sb-logo-mark">
                    <i
                        className="ti ti-heart-rate-monitor"
                        aria-hidden="true"
                    />
                </div>
                <div>
                    <div className="sb-logo-name">Cliniq</div>
                    <div className="sb-logo-sub">Doctor portal</div>
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
                    <div className="sb-av">{initials(user?.name)}</div>
                    <div className="sb-user-info">
                        <div className="sb-user-name">
                            {user?.name ?? "Doctor"}
                        </div>
                        <div className="sb-user-role">Cardiologist</div>
                    </div>
                    <button
                        className="sb-signout"
                        aria-label="Sign out"
                        onClick={() => navigate("/")}
                    >
                        <i className="ti ti-logout" aria-hidden="true" />
                    </button>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;
