import { useState, useEffect } from "react";
import {
    Moon,
    Sun,
    Search,
    Lock,
    Unlock,
    Trash2,
    Plus,
    Loader2,
    X,
    UserCog,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useUser } from "../contexts/UserContext";
import api from "../apis/api";
import { toast } from "react-hot-toast";
import API_ENDPOINTS from "../apis/endpoints";

/* ── Create admin modal ── */
const CreateAdminModal = ({ roles, onClose, onCreated }) => {
    const [values, setValues] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        roles: [],
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const toggleRole = (roleName) => {
        setValues((v) => ({
            ...v,
            roles: v.roles.includes(roleName)
                ? v.roles.filter((r) => r !== roleName)
                : [...v.roles, roleName],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!values.firstName.trim() || !values.lastName.trim()) {
            setError("First and last name are required.");
            return;
        }
        if (!values.email.trim()) {
            setError("Email is required.");
            return;
        }
        if (!values.password || values.password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }
        if (values.roles.length === 0) {
            setError("Select at least one role.");
            return;
        }

        setSaving(true);
        try {
            await api.post(API_ENDPOINTS.Admin.Admins.create, values);
            toast.success("Admin account created.");
            onCreated();
        } catch (err) {
            setError(
                err?.response?.data?.title ??
                    err?.response?.data?.message ??
                    "Failed to create admin.",
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 overflow-y-auto"
            onClick={onClose}
        >
            <form
                onSubmit={handleSubmit}
                onClick={(e) => e.stopPropagation()}
                className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-xl my-auto"
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-t1">
                        Create Admin Account
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 text-t3 hover:text-t1 hover:bg-subtle rounded-full transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium text-t2 mb-1 block">
                                First Name
                            </label>
                            <input
                                type="text"
                                value={values.firstName}
                                onChange={(e) =>
                                    setValues((v) => ({
                                        ...v,
                                        firstName: e.target.value,
                                    }))
                                }
                                className="w-full px-3 py-2 rounded-lg border border-border text-sm text-t1 bg-page focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-t2 mb-1 block">
                                Last Name
                            </label>
                            <input
                                type="text"
                                value={values.lastName}
                                onChange={(e) =>
                                    setValues((v) => ({
                                        ...v,
                                        lastName: e.target.value,
                                    }))
                                }
                                className="w-full px-3 py-2 rounded-lg border border-border text-sm text-t1 bg-page focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-medium text-t2 mb-1 block">
                            Email
                        </label>
                        <input
                            type="email"
                            value={values.email}
                            onChange={(e) =>
                                setValues((v) => ({
                                    ...v,
                                    email: e.target.value,
                                }))
                            }
                            className="w-full px-3 py-2 rounded-lg border border-border text-sm text-t1 bg-page focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-medium text-t2 mb-1 block">
                            Temporary Password
                        </label>
                        <input
                            type="password"
                            value={values.password}
                            onChange={(e) =>
                                setValues((v) => ({
                                    ...v,
                                    password: e.target.value,
                                }))
                            }
                            className="w-full px-3 py-2 rounded-lg border border-border text-sm text-t1 bg-page focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-medium text-t2 mb-1.5 block">
                            Role(s)
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {roles.map((role) => {
                                const name = role.name ?? role;
                                const active = values.roles.includes(name);
                                return (
                                    <button
                                        type="button"
                                        key={name}
                                        onClick={() => toggleRole(name)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                                            active
                                                ? "bg-primary text-white border-primary"
                                                : "bg-subtle text-t2 border-border hover:border-primary/50"
                                        }`}
                                    >
                                        {name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm text-red-500 bg-red-500/10 rounded-lg px-3 py-2">
                            {error}
                        </p>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-5">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-t2 bg-subtle border border-border hover:bg-card transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary hover:opacity-90 transition-colors disabled:opacity-60"
                    >
                        {saving && (
                            <Loader2 size={15} className="animate-spin" />
                        )}
                        Create Admin
                    </button>
                </div>
            </form>
        </div>
    );
};

/* ── Main page ── */
export const AdminAdmins = () => {
    const { toggle, theme } = useTheme();
    const { user, hasPermission } = useUser();

    const [admins, setAdmins] = useState([]);
    const [roles, setRoles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchInput, setSearchInput] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [actingId, setActingId] = useState(null);

    const canCreate = hasPermission("Permissions.Roles.Create");
    const canDelete = hasPermission("Permissions.Roles.Delete");

    useEffect(() => {
        fetchAdmins();
        fetchRoles();
    }, []);

    async function fetchAdmins() {
        try {
            setIsLoading(true);
            const res = await api.get(API_ENDPOINTS.Admin.Admins.getAll);
            setAdmins(res.data ?? []);
        } catch {
            toast.error("Failed to load admins.");
        } finally {
            setIsLoading(false);
        }
    }

    async function fetchRoles() {
        try {
            const res = await api.get(API_ENDPOINTS.Admin.Roles.getAll);
            setRoles(res.data ?? []);
        } catch {
            // non-fatal — create modal will just show no role options
        }
    }

    const handleToggleStatus = async (admin) => {
        setActingId(admin.id);
        const nextActive = admin.isDisabled || admin.status === "SUSPENDED";
        try {
            await api.patch(API_ENDPOINTS.Admin.Admins.updateStatus(admin.id), {
                active: nextActive,
            });
            setAdmins((prev) =>
                prev.map((a) =>
                    a.id === admin.id
                        ? {
                              ...a,
                              isDisabled: !nextActive,
                              status: nextActive ? "ACTIVE" : "SUSPENDED",
                          }
                        : a,
                ),
            );
            toast.success(nextActive ? "Admin unlocked." : "Admin suspended.");
        } catch {
            toast.error("Failed to update admin status.");
        } finally {
            setActingId(null);
        }
    };

    const handleDelete = async (admin) => {
        if (
            !window.confirm(
                `Delete admin ${admin.firstName} ${admin.lastName}? This can't be undone.`,
            )
        )
            return;

        setActingId(admin.id);
        try {
            await api.delete(API_ENDPOINTS.Admin.Admins.delete(admin.id));
            setAdmins((prev) => prev.filter((a) => a.id !== admin.id));
            toast.success("Admin deleted.");
        } catch {
            toast.error("Failed to delete admin.");
        } finally {
            setActingId(null);
        }
    };

    const filteredAdmins = admins.filter((a) => {
        if (searchInput === "") return true;
        const q = searchInput.toLowerCase();
        return (
            a.firstName?.toLowerCase().includes(q) ||
            a.lastName?.toLowerCase().includes(q) ||
            a.email?.toLowerCase().includes(q)
        );
    });

    return (
        <div className="bg-page w-full min-h-screen px-4 sm:px-5 py-2">
            <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-t1">
                        Admin Accounts
                    </h2>
                    <p className="text-t2 mt-1">
                        Manage staff accounts with dashboard access.
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative w-full md:w-64">
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-t3 pointer-events-none"
                        />
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search admins..."
                            className="w-full pl-9 pr-4 py-2 bg-subtle border border-border rounded-lg text-t1 text-sm focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                    {canCreate && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:opacity-90 transition-opacity whitespace-nowrap"
                        >
                            <Plus size={16} /> New Admin
                        </button>
                    )}
                    <button
                        onClick={toggle}
                        className="p-2 text-t2 hover:text-primary hover:bg-subtle rounded-full transition-colors"
                    >
                        {theme === "light" ? (
                            <Moon size={22} />
                        ) : (
                            <Sun size={22} />
                        )}
                    </button>
                </div>
            </header>

            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-left border-collapse">
                        <thead>
                            <tr className="bg-subtle text-t2 text-sm border-b border-border">
                                <th className="p-4 font-medium">Name</th>
                                <th className="p-4 font-medium">Email</th>
                                <th className="p-4 font-medium">Role(s)</th>
                                <th className="p-4 font-medium">Status</th>
                                <th className="p-4 font-medium text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="py-12 text-center text-t3"
                                    >
                                        <Loader2
                                            size={24}
                                            className="animate-spin mx-auto mb-2"
                                            style={{ color: "#185FA5" }}
                                        />
                                        Loading admins...
                                    </td>
                                </tr>
                            ) : filteredAdmins.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="py-12 text-center text-t3 text-sm"
                                    >
                                        <UserCog
                                            size={24}
                                            className="mx-auto mb-2 text-t3"
                                        />
                                        No admins found.
                                    </td>
                                </tr>
                            ) : (
                                filteredAdmins.map((admin) => {
                                    const isSuspended =
                                        admin.isDisabled ||
                                        admin.status === "SUSPENDED";
                                    const isSelf = admin.id === user?.id;
                                    return (
                                        <tr
                                            key={admin.id}
                                            className="border-b border-border hover:bg-subtle transition-colors"
                                        >
                                            <td className="p-4 font-medium text-t1">
                                                {admin.firstName}{" "}
                                                {admin.lastName}
                                                {isSelf && (
                                                    <span className="ml-2 text-xs text-t3 font-normal">
                                                        (you)
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-t2 text-sm">
                                                {admin.email}
                                            </td>
                                            <td className="p-4 text-t2 text-sm">
                                                {(admin.roles ?? []).join(", ")}
                                            </td>
                                            <td className="p-4">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        isSuspended
                                                            ? "bg-red-500/10 text-red-600 dark:text-red-400"
                                                            : "bg-green-500/10 text-green-600 dark:text-green-400"
                                                    }`}
                                                >
                                                    {isSuspended
                                                        ? "Suspended"
                                                        : "Active"}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                {!isSelf && (
                                                    <div className="flex items-center justify-end gap-2 flex-wrap">
                                                        <button
                                                            onClick={() =>
                                                                handleToggleStatus(
                                                                    admin,
                                                                )
                                                            }
                                                            disabled={
                                                                actingId ===
                                                                admin.id
                                                            }
                                                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 whitespace-nowrap ${
                                                                isSuspended
                                                                    ? "bg-primary/10 text-primary hover:bg-primary/20"
                                                                    : "bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20"
                                                            }`}
                                                        >
                                                            {actingId ===
                                                            admin.id ? (
                                                                <Loader2
                                                                    size={13}
                                                                    className="animate-spin"
                                                                />
                                                            ) : isSuspended ? (
                                                                <Unlock
                                                                    size={13}
                                                                />
                                                            ) : (
                                                                <Lock
                                                                    size={13}
                                                                />
                                                            )}
                                                            {isSuspended
                                                                ? "Unlock"
                                                                : "Suspend"}
                                                        </button>
                                                        {canDelete && (
                                                            <button
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        admin,
                                                                    )
                                                                }
                                                                disabled={
                                                                    actingId ===
                                                                    admin.id
                                                                }
                                                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                                                            >
                                                                <Trash2
                                                                    size={13}
                                                                />
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showCreateModal && (
                <CreateAdminModal
                    roles={roles}
                    onClose={() => setShowCreateModal(false)}
                    onCreated={() => {
                        setShowCreateModal(false);
                        fetchAdmins();
                    }}
                />
            )}
        </div>
    );
};

export default AdminAdmins;
