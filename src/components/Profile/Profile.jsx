import React, { useEffect, useState } from "react";
import { useUser } from "../../contexts/UserContext";
import {
    Pencil,
    MapPin,
    Clock,
    Award,
    Stethoscope,
    Briefcase,
    Check,
    X,
    Camera,
    GraduationCap,
    Building2,
} from "lucide-react";
import api from "../../apis/api";
import { User } from "lucide-react";
import API_ENDPOINTS from "../../apis/endpoints";
import { Users } from "lucide-react";

export default function Profile({ onUpdateDoctorInfo }) {
    const { user } = useUser();
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProfile() {
            try {
                const res = await api.get(API_ENDPOINTS.Doctor.getOrUpdateMe);
                setProfile(res.data);
                setEditForm(res.data);
            } catch (err) {
                console.error("Failed to fetch profile", err);
            } finally {
                setLoading(false);
            }
        }
        fetchProfile();
    }, []);

    const handleEditClick = () => setIsEditing(true);
    const handleSaveClick = async () => {
        try {
            const res = await api.put(
                API_ENDPOINTS.Doctor.getOrUpdateMe,
                editForm,
            );
            setProfile(res.data);
            setIsEditing(false);
            if (onUpdateDoctorInfo) {
                onUpdateDoctorInfo({
                    name: `${res.data.firstName} ${res.data.lastName}`,
                    specialty: res.data.specialization,
                });
            }
        } catch (err) {
            console.error("Failed to update profile", err);
        }
    };
    const handleCancelClick = () => {
        setEditForm({ ...profile });
        setIsEditing(false);
    };
    const handleInputChange = (e) => {
        setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };
    const handleSpecialtyChange = (index, value) => {
        const updated = [...editForm.specialties];
        updated[index] = value;
        setEditForm((prev) => ({ ...prev, specialties: updated }));
    };
    const handleImageChange = (e) => {
        if (e.target.files?.[0]) {
            const reader = new FileReader();
            reader.onload = (event) =>
                setEditForm((prev) => ({
                    ...prev,
                    image: event.target.result,
                }));
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    if (loading)
        return (
            <div className="flex items-center justify-center h-64 text-slate-400">
                Loading...
            </div>
        );

    if (!profile) {
        return null;
    }

    const displayData = isEditing ? editForm : profile;

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
                            Edit Profile
                        </button>
                    ) : (
                        <div className="flex gap-3">
                            <button
                                onClick={handleSaveClick}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-all duration-200 hover:-translate-y-0.5"
                            >
                                <Check size={15} />
                                Save Changes
                            </button>
                            <button
                                onClick={handleCancelClick}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-t2 bg-card border border-border hover:bg-subtle   transition-all duration-200"
                            >
                                <X size={15} />
                                Cancel
                            </button>
                        </div>
                    )}
                </div>

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
                        {/* Available badge */}
                        <span className="absolute top-5 left-5 flex items-center gap-1.5 text-xs font-medium bg-white/10 text-emerald-300 border border-emerald-400/30 rounded-full px-3 py-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Available
                        </span>

                        {/* Photo */}
                        <div className="relative mt-4 mb-5">
                            {displayData.image ? (
                                <img
                                    src={displayData.image}
                                    alt={displayData.name}
                                    className="w-36 h-36 rounded-full object-cover border-4 border-white/20 shadow-2xl"
                                />
                            ) : (
                                <div className="w-36 h-36 rounded-full text-t2 object-cover flex justify-center items-center border-4 border-white/20 shadow-2xl">
                                    <Users size={50} />
                                </div>
                            )}
                            {isEditing && (
                                <label className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-white flex items-center justify-center cursor-pointer shadow-md hover:scale-105 transition-transform">
                                    <Camera
                                        size={16}
                                        className="text-slate-700"
                                    />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>

                        {/* Name */}
                        {/* {isEditing ? (
                            <input
                                type="text"
                                name="name"
                                value={editForm.name}
                                onChange={handleInputChange}
                                className="w-full text-center text-lg font-bold bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:border-white/50 mb-1"
                            />
                        ) : (
                            <h2 className="text-xl font-bold text-center leading-tight mb-1">
                                {profile?.firstName}
                            </h2>
                        )} */}

                        {/* Specialty tag */}
                        {/* {isEditing ? (
                            <input
                                type="text"
                                name="specialty"
                                value={editForm.specialty}
                                onChange={handleInputChange}
                                className="w-full text-center text-sm bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 text-white/80 placeholder-white/40 focus:outline-none focus:border-white/50 mt-1 mb-5"
                            />
                        ) : (
                            <span className="text-sm font-medium text-blue-200 mb-5">
                                {profile.specialty}
                            </span>
                        )} */}

                        {/* Quick-info pills */}
                        {/* <div className="w-full space-y-3 mt-2">
                            <InfoPill
                                icon={<Building2 size={14} />}
                                label={displayData.hospital}
                                editing={isEditing}
                            >
                                {isEditing && (
                                    <input
                                        type="text"
                                        name="hospital"
                                        value={editForm.hospital}
                                        onChange={handleInputChange}
                                        className="flex-1 bg-transparent border-b border-white/30 text-white text-sm focus:outline-none focus:border-white/70 pb-0.5"
                                    />
                                )}
                            </InfoPill>
                            <InfoPill
                                icon={<MapPin size={14} />}
                                label={displayData.location}
                                editing={isEditing}
                            >
                                {isEditing && (
                                    <input
                                        type="text"
                                        name="location"
                                        value={editForm.location}
                                        onChange={handleInputChange}
                                        className="flex-1 bg-transparent border-b border-white/30 text-white text-sm focus:outline-none focus:border-white/70 pb-0.5"
                                    />
                                )}
                            </InfoPill>
                            <InfoPill
                                icon={<GraduationCap size={14} />}
                                label={displayData.degree}
                                editing={isEditing}
                            >
                                {isEditing && (
                                    <input
                                        type="text"
                                        name="degree"
                                        value={editForm.degree}
                                        onChange={handleInputChange}
                                        className="flex-1 bg-transparent border-b border-white/30 text-white text-sm focus:outline-none focus:border-white/70 pb-0.5"
                                    />
                                )}
                            </InfoPill>
                        </div> */}
                    </div>

                    {/* ── RIGHT: Detail Panel ── */}
                    <div className="flex-1 p-8 space-y-8">
                        {/* Personal Info */}
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
                                    name="email"
                                    value={
                                        isEditing
                                            ? editForm.email
                                            : profile.email
                                    }
                                    editing={isEditing}
                                    onChange={handleInputChange}
                                    type="email"
                                />
                                <Field
                                    label="Date of Birth"
                                    name="dateOfBirth"
                                    value={
                                        isEditing
                                            ? editForm.dateOfBirth
                                            : profile.dateOfBirth
                                    }
                                    editing={isEditing}
                                    onChange={handleInputChange}
                                    type="date"
                                />
                                <div className="sm:col-span-2">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-t3 mb-2">
                                        Gender
                                    </p>
                                    {isEditing ? (
                                        <div className="flex gap-3">
                                            {["Male", "Female"].map((g) => (
                                                <button
                                                    key={g}
                                                    type="button"
                                                    onClick={() =>
                                                        setEditForm((prev) => ({
                                                            ...prev,
                                                            gender: g,
                                                        }))
                                                    }
                                                    className={`px-5 py-2 rounded-xl text-sm font-medium border-2 transition-colors ${
                                                        editForm.gender === g
                                                            ? "border-[#185FA5] bg-blue-50 text-[#185FA5]"
                                                            : "border-border text-t2 bg-card"
                                                    }`}
                                                >
                                                    {g}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-sm font-medium text-t1 px-4 py-2 rounded-xl bg-subtle border border-border inline-block">
                                            {profile.gender ?? "—"}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Section>

                        <Divider />

                        {/* Professional Info */}
                        <Section
                            icon={<Stethoscope size={16} />}
                            title="Professional Information"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field
                                    label="Specialization"
                                    name="specialization"
                                    value={
                                        isEditing
                                            ? editForm.specialization
                                            : profile.specialization
                                    }
                                    editing={isEditing}
                                    onChange={handleInputChange}
                                />
                                <Field
                                    label="License Number"
                                    name="licenseNumber"
                                    value={
                                        isEditing
                                            ? editForm.licenseNumber
                                            : profile.licenseNumber
                                    }
                                    editing={isEditing}
                                    onChange={handleInputChange}
                                />
                                <Field
                                    label="License Expiry Date"
                                    name="licenseExpiryDate"
                                    value={
                                        isEditing
                                            ? editForm.licenseExpiryDate
                                            : profile.licenseExpiryDate
                                    }
                                    editing={isEditing}
                                    onChange={handleInputChange}
                                    type="date"
                                />
                            </div>
                        </Section>
                        {/* Specialties */}
                        {/* <Section
                            icon={<Stethoscope size={16} />}
                            title="Specialties"
                        >
                            {isEditing ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {editForm?.specialties?.map((spec, i) => (
                                        <input
                                            key={i}
                                            type="text"
                                            value={spec}
                                            onChange={(e) =>
                                                handleSpecialtyChange(
                                                    i,
                                                    e.target.value,
                                                )
                                            }
                                            className="px-4 py-2.5 rounded-xl border-2 border-border text-sm text-t1 bg-card focus:outline-none focus:border-blue-400 transition-colors"
                                            placeholder={`Specialty ${i + 1}`}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {profile?.specialties?.map((spec, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-subtle border border-border"
                                        >
                                            <span
                                                className="w-2 h-2 rounded-full flex-shrink-0"
                                                style={{
                                                    background: "#185FA5",
                                                }}
                                            />
                                            <span className="text-sm font-medium text-t1">
                                                {spec}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Section> */}

                        {/* <Divider /> */}

                        {/* Experience + Hours row */}
                        {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <Section
                                icon={<Briefcase size={16} />}
                                title="Experience"
                            >
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="experience"
                                        value={editForm.experience}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-blue-400 transition-colors"
                                    />
                                ) : (
                                    <p className="text-3xl font-bold text-t1 mt-1">
                                        {profile.experience}
                                    </p>
                                )}
                            </Section>

                            <Section
                                icon={<Clock size={16} />}
                                title="Opening Hours"
                            >
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="workingHours"
                                        value={editForm.workingHours}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-blue-400 transition-colors"
                                    />
                                ) : (
                                    <p className="text-sm font-medium text-t2 mt-1 leading-relaxed">
                                        {profile.workingHours}
                                    </p>
                                )}
                            </Section>
                        </div> */}

                        {/* <Divider /> */}

                        {/* Awards */}
                        {/* <Section
                            icon={<Award size={16} />}
                            title="Awards & Recognition"
                        >
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="awards"
                                    value={editForm.awards}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 rounded-xl border-2 border-border text-sm text-slate-700 focus:outline-none focus:border-blue-400 transition-colors"
                                />
                            ) : (
                                <div className="flex items-start gap-3 p-4 rounded-xl bg-subtle border border-border">
                                    <Award
                                        size={18}
                                        className="text-amber-500 flex-shrink-0 mt-0.5"
                                    />
                                    <span className="text-sm font-medium text-t1">
                                        {profile.awards}
                                    </span>
                                </div>
                            )}
                        </Section> */}
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

function InfoPill({ icon, label, editing, children }) {
    return (
        <div className="flex items-center gap-3 text-white/70">
            <span className="text-white/50 shrink-0">{icon}</span>
            {editing ? (
                children
            ) : (
                <span className="text-sm leading-snug">{label}</span>
            )}
        </div>
    );
}
function Field({ label, name, value, editing, onChange, type = "text" }) {
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
                <p className="text-sm font-medium text-t1 px-4 py-2.5 rounded-xl bg-subtle border border-border">
                    {value ?? "—"}
                </p>
            )}
        </div>
    );
}
