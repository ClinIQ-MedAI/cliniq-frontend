import { useState, useEffect } from "react";
import {
    Moon,
    Sun,
    Plus,
    Pencil,
    Trash2,
    Loader2,
    X,
    Shield,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useUser } from "../contexts/UserContext";
import api from "../apis/api";
import { toast } from "react-hot-toast";
import API_ENDPOINTS from "../apis/endpoints";

/* ── Create/edit role modal ── */
const RoleFormModal = ({ role, allPermissions, onClose, onSaved }) => {
    const isEditing = Boolean(role);
    const [name, setName] = useState(role?.name ?? "");
    const [selected, setSelected] = useState(role?.permissions ?? []);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const togglePermission = (perm) => {
        setSelected((prev) =>
            prev.includes(perm)
                ? prev.filter((p) => p !== perm)
                : [...prev, perm],
        );
    };

    // Group permissions by their prefix, e.g. "Permissions.Patients.View" -> "Patients"
    const grouped = allPermissions.reduce((acc, perm) => {
        const parts = perm.split(".");
        const group = parts.length >= 2 ? parts[1] : "Other";
        acc[group] = acc[group] ?? [];
        acc[group].push(perm);
        return acc;
    }, {});

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!name.trim()) {
            setError("Role name is required.");
            return;
        }
        if (selected.length === 0) {
            setError("Select at least one permission.");
            return;
        }

        setSaving(true);
        try {
            const payload = { name: name.trim(), permissions: selected };
            if (isEditing) {
                await api.put(
                    API_ENDPOINTS.Admin.Roles.update(role.id),
                    payload,
                );
                toast.success("Role updated.");
            } else {
                await api.post(API_ENDPOINTS.Admin.Roles.create, payload);
                toast.success("Role created.");
            }
            onSaved();
        } catch (err) {
            setError(
                err?.response?.data?.title ??
                    err?.response?.data?.message ??
                    `Failed to ${isEditing ? "update" : "create"} role.`,
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
                className="bg-card border border-border rounded-2xl p-6 w-full max-w-xl shadow-xl my-auto max-h-[90vh] overflow-y-auto"
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-t1">
                        {isEditing ? "Edit Role" : "Create Role"}
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 text-t3 hover:text-t1 hover:bg-subtle rounded-full transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="mb-4">
                    <label className="text-xs font-medium text-t2 mb-1 block">
                        Role Name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. BillingAdmin"
                        className="w-full px-3 py-2 rounded-lg border border-border text-sm text-t1 bg-page focus:outline-none focus:border-primary transition-colors"
                    />
                </div>

                <div className="mb-4">
                    <label className="text-xs font-medium text-t2 mb-2 block">
                        Permissions
                    </label>
                    <div className="space-y-4">
                        {Object.entries(grouped).map(([group, perms]) => (
                            <div key={group}>
                                <div className="text-xs font-semibold text-t3 uppercase tracking-wide mb-1.5">
                                    {group}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {perms.map((perm) => {
                                        const active = selected.includes(perm);
                                        const shortLabel = perm
                                            .split(".")
                                            .pop();
                                        return (
                                            <button
                                                type="button"
                                                key={perm}
                                                onClick={() =>
                                                    togglePermission(perm)
                                                }
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                                                    active
                                                        ? "bg-primary text-white border-primary"
                                                        : "bg-subtle text-t2 border-border hover:border-primary/50"
                                                }`}
                                            >
                                                {shortLabel}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {error && (
                    <p className="text-sm text-red-500 bg-red-500/10 rounded-lg px-3 py-2 mb-4">
                        {error}
                    </p>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
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
                        {isEditing ? "Save Changes" : "Create Role"}
                    </button>
                </div>
            </form>
        </div>
    );
};

/* ── Main page ── */
export const AdminRoles = () => {
    const { toggle, theme } = useTheme();
    const { hasPermission } = useUser();

    const [roles, setRoles] = useState([]);
    const [allPermissions, setAllPermissions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingRole, setEditingRole] = useState(null);
    const [showCreate, setShowCreate] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const canCreate = hasPermission("Permissions.Roles.Create");
    const canUpdate = hasPermission("Permissions.Roles.Update");
    const canDelete = hasPermission("Permissions.Roles.Delete");

    useEffect(() => {
        fetchRoles();
        fetchPermissions();
    }, []);

    async function fetchRoles() {
        try {
            setIsLoading(true);
            const res = await api.get(API_ENDPOINTS.Admin.Roles.getAll);
            setRoles(res.data ?? []);
        } catch {
            toast.error("Failed to load roles.");
        } finally {
            setIsLoading(false);
        }
    }

    async function fetchPermissions() {
        try {
            const res = await api.get(
                API_ENDPOINTS.Admin.Roles.getAllPermissions,
            );
            setAllPermissions(res.data ?? []);
        } catch {
            toast.error("Failed to load available permissions.");
        }
    }

    const handleDelete = async (role) => {
        if (
            !window.confirm(
                `Delete role "${role.name}"? Admins assigned this role may lose access.`,
            )
        )
            return;

        setDeletingId(role.id);
        try {
            await api.delete(API_ENDPOINTS.Admin.Roles.delete(role.id));
            setRoles((prev) => prev.filter((r) => r.id !== role.id));
            toast.success("Role deleted.");
        } catch {
            toast.error("Failed to delete role.");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="bg-page w-full min-h-screen px-4 sm:px-5 py-2">
            <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-t1">
                        Roles & Permissions
                    </h2>
                    <p className="text-t2 mt-1">
                        Define what each admin role is allowed to do.
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {canCreate && (
                        <button
                            onClick={() => setShowCreate(true)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:opacity-90 transition-opacity whitespace-nowrap"
                        >
                            <Plus size={16} /> New Role
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
                    <table className="w-full min-w-[640px] text-left border-collapse">
                        <thead>
                            <tr className="bg-subtle text-t2 text-sm border-b border-border">
                                <th className="p-4 font-medium">Role</th>
                                <th className="p-4 font-medium">Permissions</th>
                                <th className="p-4 font-medium text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td
                                        colSpan="3"
                                        className="py-12 text-center text-t3"
                                    >
                                        <Loader2
                                            size={24}
                                            className="animate-spin mx-auto mb-2"
                                            style={{ color: "#185FA5" }}
                                        />
                                        Loading roles...
                                    </td>
                                </tr>
                            ) : roles.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="3"
                                        className="py-12 text-center text-t3 text-sm"
                                    >
                                        <Shield
                                            size={24}
                                            className="mx-auto mb-2 text-t3"
                                        />
                                        No roles found.
                                    </td>
                                </tr>
                            ) : (
                                roles.map((role) => (
                                    <tr
                                        key={role.id}
                                        className="border-b border-border hover:bg-subtle transition-colors align-top"
                                    >
                                        <td className="p-4 font-medium text-t1 whitespace-nowrap">
                                            {role.name}
                                        </td>
                                        <td className="p-4 text-t2 text-sm">
                                            <div className="flex flex-wrap gap-1.5 max-w-md">
                                                {(role.permissions ?? [])
                                                    .slice(0, 6)
                                                    .map((p) => (
                                                        <span
                                                            key={p}
                                                            className="px-2 py-0.5 rounded-full text-xs bg-subtle border border-border"
                                                        >
                                                            {p.split(".").pop()}
                                                        </span>
                                                    ))}
                                                {(role.permissions ?? [])
                                                    .length > 6 && (
                                                    <span className="px-2 py-0.5 text-xs text-t3">
                                                        +
                                                        {role.permissions
                                                            .length - 6}{" "}
                                                        more
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-end gap-2">
                                                {canUpdate && (
                                                    <button
                                                        onClick={() =>
                                                            setEditingRole(role)
                                                        }
                                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                                                    >
                                                        <Pencil size={13} />
                                                        Edit
                                                    </button>
                                                )}
                                                {canDelete && (
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(role)
                                                        }
                                                        disabled={
                                                            deletingId ===
                                                            role.id
                                                        }
                                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                                                    >
                                                        {deletingId ===
                                                        role.id ? (
                                                            <Loader2
                                                                size={13}
                                                                className="animate-spin"
                                                            />
                                                        ) : (
                                                            <Trash2 size={13} />
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {(showCreate || editingRole) && (
                <RoleFormModal
                    role={editingRole}
                    allPermissions={allPermissions}
                    onClose={() => {
                        setShowCreate(false);
                        setEditingRole(null);
                    }}
                    onSaved={() => {
                        setShowCreate(false);
                        setEditingRole(null);
                        fetchRoles();
                    }}
                />
            )}
        </div>
    );
};

export default AdminRoles;
