import React, { useEffect, useState } from "react";
import { useUser } from "../../contexts/UserContext";
import {
    Pencil,
    Check,
    X,
    Stethoscope,
    User,
    Users,
    ShieldCheck,
} from "lucide-react";
import api from "../../apis/api";
import API_ENDPOINTS from "../../apis/endpoints";

// Matches Doctor.Profile's DoctorProfileResponse exactly:
// (email, userName, firstName, lastName, specialization, licenseNumber,
//  licenseExpiryDate, personalIdentityPhotoUrl, medicalLicenseUrl,
//  rejectionReason, status)
// Only firstName/lastName are ever written back — UpdateProfileAsync on the
// backend ignores everything else, so this component only lets those two
// fields be edited. Everything else below is read-only, sourced straight
// from the GET response.

const STATUS_META = {
    PENDING_VERIFICATION: {
        label: "Pending verification",
        pill: "bg-[#FAEEDA] text-[#854F0B]",
    },
    VERIFIED: { label: "Verified", pill: "bg-[#E1F5EE] text-[#0F6E56]" },
    REJECTED: { label: "Rejected", pill: "bg-[#FCEBEB] text-[#A32D2D]" },
    INCOMPLETE_PROFILE: {
        label: "Incomplete profile",
        pill: "bg-subtle text-t2",
    },
};

export default function Profile({ onUpdateDoctorInfo }) {
    const { user } = useUser();
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ firstName: "", lastName: "" });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");
    const [photoFailed, setPhotoFailed] = useState(false);

    useEffect(() => {
        async function fetchProfile() {
            try {
                const res = await api.get(API_ENDPOINTS.Doctor.getOrUpdateMe);
                setProfile(res.data);
                setEditForm({
                    firstName: res.data.firstName ?? "",
                    lastName: res.data.lastName ?? "",
                });
            } catch (err) {
                console.error("Failed to fetch profile", err);
            } finally {
                setLoading(false);
            }
        }
        fetchProfile();
    }, []);

    const handleEditClick = () => {
        setSaveError("");
        setIsEditing(true);
    };

    const handleSaveClick = async () => {
        try {
            setSaving(true);
            setSaveError("");
            // Only firstName/lastName are sent — that's all the backend
            // actually persists (see UpdateProfileAsync).
            await api.put(API_ENDPOINTS.Doctor.getOrUpdateMe, {
                firstName: editForm.firstName,
                lastName: editForm.lastName,
            });
            setProfile((prev) => ({
                ...prev,
                firstName: editForm.firstName,
                lastName: editForm.lastName,
            }));
            setIsEditing(false);
            if (onUpdateDoctorInfo) {
                onUpdateDoctorInfo({
                    name: `${editForm.firstName} ${editForm.lastName}`,
                    specialty: profile?.specialization,
                });
            }
        } catch (err) {
            setSaveError(
                err?.response?.data?.title ??
                    err?.response?.data?.message ??
                    "Failed to save changes",
            );
        } finally {
            setSaving(false);
        }
    };

    const handleCancelClick = () => {
        setEditForm({
            firstName: profile?.firstName ?? "",
            lastName: profile?.lastName ?? "",
        });
        setSaveError("");
        setIsEditing(false);
    };

    const handleInputChange = (e) => {
        setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    if (loading)
        return (
            <div className="flex items-center justify-center h-64 text-slate-400">
                Loading...
            </div>
        );

    if (!profile) return null;

    const statusMeta = STATUS_META[profile.status] ?? {
        label: profile.status ?? "Unknown",
        pill: "bg-subtle text-t2",
    };

    return (
        <div className="w-full bg-page p-6">
            <title>Profile - ClinIQ</title>

            <div className="max-w-5xl mx-auto">
                {/* Page header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-t1">
                            My Profile
                        </h1>
                        <p className="text-sm text-t2 mt-1">
                            Logged in as{" "}
                            <span className="font-semibold text-t1">
                                {user?.firstName} {user?.lastName}
                            </span>
                        </p>
                    </div>

                    {!isEditing ? (
                        <button
                            onClick={handleEditClick}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                            style={{
                                background: "#185FA5",
                                boxShadow: "0 4px 14px rgba(24,95,165,0.3)",
                            }}
                        >
                            <Pencil size={15} />
                            Edit Name
                        </button>
                    ) : (
                        <div className="flex gap-3">
                            <button
                                onClick={handleSaveClick}
                                disabled={saving}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                <Check size={15} />
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                            <button
                                onClick={handleCancelClick}
                                disabled={saving}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-t2 bg-card border border-border hover:bg-subtle transition-all duration-200 disabled:opacity-60"
                            >
                                <X size={15} />
                                Cancel
                            </button>
                        </div>
                    )}
                </div>

                {saveError && (
                    <div className="mb-4 px-4 py-2.5 rounded-xl bg-[#FCEBEB] text-[#A32D2D] text-sm">
                        {saveError}
                    </div>
                )}

                {/* Main card */}
                <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden flex flex-col lg:flex-row">
                    {/* ── LEFT: Identity Panel ── */}
                    <div
                        className="lg:w-72 shrink-0 flex flex-col items-center py-10 px-8 text-white relative"
                        style={{
                            background:
                                "linear-gradient(160deg, #0B1629 0%, #185FA5 100%)",
                        }}
                    >
                        <span
                            className={`absolute top-5 left-5 flex items-center gap-1.5 text-xs font-medium rounded-full px-3 py-1 ${
                                profile.status === "VERIFIED"
                                    ? "bg-white/10 text-emerald-300 border border-emerald-400/30"
                                    : "bg-white/10 text-white/80 border border-white/20"
                            }`}
                        >
                            {profile.status === "VERIFIED" && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            )}
                            {statusMeta.label}
                        </span>

                        {/* Photo — display only, no upload endpoint exists yet */}
                        <div className="relative mt-4 mb-5">
                            {profile.personalIdentityPhotoUrl &&
                            !photoFailed ? (
                                <img
                                    src={profile.personalIdentityPhotoUrl}
                                    alt={`${profile.firstName} ${profile.lastName}`}
                                    onError={() => setPhotoFailed(true)}
                                    className="w-36 h-36 rounded-full object-cover border-4 border-white/20 shadow-2xl"
                                />
                            ) : (
                                <div className="w-36 h-36 rounded-full text-white/60 object-cover flex justify-center items-center border-4 border-white/20 shadow-2xl">
                                    <Users size={50} />
                                </div>
                            )}
                        </div>

                        <h2 className="text-xl font-bold text-center leading-tight mb-1">
                            {profile.firstName} {profile.lastName}
                        </h2>
                        {profile.specialization && (
                            <span className="text-sm font-medium text-blue-200">
                                {profile.specialization}
                            </span>
                        )}

                        {profile.status === "REJECTED" &&
                            profile.rejectionReason && (
                                <div className="mt-5 w-full text-xs bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white/80">
                                    <span className="font-semibold block mb-1">
                                        Rejection reason
                                    </span>
                                    {profile.rejectionReason}
                                </div>
                            )}
                    </div>

                    {/* ── RIGHT: Detail Panel ── */}
                    <div className="flex-1 p-8 space-y-8">
                        {/* Personal Info — the only editable section */}
                        <Section
                            icon={<User size={16} />}
                            title="Personal Information"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field
                                    label="First Name"
                                    name="firstName"
                                    value={
                                        isEditing
                                            ? editForm.firstName
                                            : profile.firstName
                                    }
                                    editing={isEditing}
                                    onChange={handleInputChange}
                                />
                                <Field
                                    label="Last Name"
                                    name="lastName"
                                    value={
                                        isEditing
                                            ? editForm.lastName
                                            : profile.lastName
                                    }
                                    editing={isEditing}
                                    onChange={handleInputChange}
                                />
                                <Field
                                    label="Email Address"
                                    value={profile.email}
                                    readOnlyNote="Managed via account settings"
                                />
                                <Field
                                    label="Username"
                                    value={profile.userName}
                                    readOnlyNote="Managed via account settings"
                                />
                            </div>
                        </Section>

                        <Divider />

                        {/* Professional Info — read only, backend has no
                            update path for these fields */}
                        <Section
                            icon={<Stethoscope size={16} />}
                            title="Professional Information"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field
                                    label="Specialization"
                                    value={profile.specialization}
                                    readOnlyNote="Set during verification"
                                />
                                <Field
                                    label="License Number"
                                    value={profile.licenseNumber}
                                    readOnlyNote="Set during verification"
                                />
                                <Field
                                    label="License Expiry Date"
                                    value={
                                        profile.licenseExpiryDate
                                            ? new Date(
                                                  profile.licenseExpiryDate,
                                              ).toLocaleDateString()
                                            : null
                                    }
                                    readOnlyNote="Set during verification"
                                />
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-widest text-t3 mb-2">
                                        Verification Status
                                    </p>
                                    <span
                                        className={`inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2.5 rounded-xl ${statusMeta.pill}`}
                                    >
                                        <ShieldCheck size={14} />
                                        {statusMeta.label}
                                    </span>
                                </div>
                            </div>
                        </Section>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ── Helpers ── */

function Section({ icon, title, children }) {
    return (
        <div>
            <div className="flex items-center gap-2 mb-4">
                <span style={{ color: "#185FA5" }}>{icon}</span>
                <h3 className="text-xs font-bold uppercase tracking-widest text-t3">
                    {title}
                </h3>
            </div>
            {children}
        </div>
    );
}

function Divider() {
    return <hr className="border-border" />;
}

// `editing` + `onChange`/`name` together make this an editable input.
// Omit those and pass `readOnlyNote` for fields the backend doesn't accept
// updates for — they render as plain, slightly muted display boxes so it's
// visually clear they can't be changed here.
function Field({
    label,
    name,
    value,
    editing = false,
    onChange,
    type = "text",
    readOnlyNote,
}) {
    return (
        <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-t3 mb-2">
                {label}
            </p>
            {editing ? (
                <input
                    type={type}
                    name={name}
                    value={value ?? ""}
                    onChange={onChange}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-border text-sm text-t1 bg-card focus:outline-none focus:border-blue-400 transition-colors"
                />
            ) : (
                <>
                    <p className="text-sm font-medium text-t1 px-4 py-2.5 rounded-xl bg-subtle border border-border">
                        {value ?? "—"}
                    </p>
                    {readOnlyNote && (
                        <p className="text-[11px] text-t3 mt-1">
                            {readOnlyNote}
                        </p>
                    )}
                </>
            )}
        </div>
    );
}
