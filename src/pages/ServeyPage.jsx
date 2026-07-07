import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
    Stethoscope,
    FileText,
    IdCard,
    CalendarDays,
    Upload,
    CheckCircle2,
    Loader2,
    ChevronRight,
    ChevronLeft,
    X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../apis/api";
import API_ENDPOINTS from "../apis/endpoints";
import { useUser } from "../contexts/UserContext";

const STEPS = [
    { id: 1, title: "Professional Info", icon: Stethoscope },
    { id: 2, title: "License Details", icon: FileText },
    { id: 3, title: "Documents", icon: IdCard },
];

export default function Survey() {
    const { updateUser } = useUser();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [idPhotoFile, setIdPhotoFile] = useState(null);
    const [licenseFile, setLicenseFile] = useState(null);
    const [idPhotoPreview, setIdPhotoPreview] = useState(null);
    const [licensePreview, setLicensePreview] = useState(null);

    const {
        register,
        handleSubmit,
        trigger,
        formState: { errors },
    } = useForm();

    const handleFileChange = (e, type) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const preview = URL.createObjectURL(file);
        if (type === "id") {
            setIdPhotoFile(file);
            setIdPhotoPreview(preview);
        } else {
            setLicenseFile(file);
            setLicensePreview(preview);
        }
    };

    const removeFile = (type) => {
        if (type === "id") {
            setIdPhotoFile(null);
            setIdPhotoPreview(null);
        } else {
            setLicenseFile(null);
            setLicensePreview(null);
        }
    };

    const nextStep = async () => {
        const fieldsPerStep = {
            1: ["specialization"],
            2: ["licenseNumber", "licenseExpiryDate"],
        };
        const valid = await trigger(fieldsPerStep[step]);
        if (valid) setStep((s) => s + 1);
    };

    const onSubmit = async (data) => {
        if (!idPhotoFile || !licenseFile) {
            toast.error("Please upload both documents.");
            return;
        }
        setIsSubmitting(true);
        try {
            const personalIdentityPhotoUrl = URL.createObjectURL(idPhotoFile);
            const medicalLicenseUrl = URL.createObjectURL(licenseFile);

            await api.post(API_ENDPOINTS.Doctor.survey, {
                specialization: data.specialization,
                licenseNumber: data.licenseNumber,
                licenseExpiryDate: data.licenseExpiryDate,
                personalIdentityPhotoUrl,
                medicalLicenseUrl,
            });

            // Survey succeeded → the real doctorStatus is now PENDING_VERIFICATION
            // on the backend/token, but our local user object doesn't know that yet.
            // Update it here so VerificationStatus.jsx shows the right screen
            // immediately, without waiting on /doctor/me (which never returns status).
            updateUser({ doctorStatus: "PENDING_VERIFICATION" });

            toast.success("Survey submitted successfully!");
            navigate("/verification-status");
        } catch (err) {
            toast.error(err.response?.data?.message || "Something went wrong.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-page flex items-center justify-center p-6">
            <div className="w-full max-w-lg">
                {/* Header */}
                <div className="text-center mb-8">
                    <div
                        className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
                        style={{
                            background:
                                "linear-gradient(135deg, #0B1629, #185FA5)",
                        }}
                    >
                        <Stethoscope size={26} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-t1">
                        Complete Your Profile
                    </h1>
                    <p className="text-sm text-t2 mt-1">
                        We need a few details to verify your credentials
                    </p>
                </div>

                {/* Step indicators */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    {STEPS.map((s, i) => (
                        <div key={s.id} className="flex items-center gap-2">
                            <div className="flex items-center gap-2">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                                        step > s.id
                                            ? "bg-emerald-500 text-white"
                                            : step === s.id
                                              ? "text-white"
                                              : "bg-subtle border border-border text-t3"
                                    }`}
                                    style={
                                        step === s.id
                                            ? { background: "#185FA5" }
                                            : {}
                                    }
                                >
                                    {step > s.id ? (
                                        <CheckCircle2 size={14} />
                                    ) : (
                                        s.id
                                    )}
                                </div>
                                <span
                                    className={`text-xs font-medium hidden sm:block ${
                                        step === s.id ? "text-t1" : "text-t3"
                                    }`}
                                >
                                    {s.title}
                                </span>
                            </div>
                            {i < STEPS.length - 1 && (
                                <div
                                    className={`w-8 h-px transition-colors duration-300 ${
                                        step > s.id
                                            ? "bg-emerald-400"
                                            : "bg-border"
                                    }`}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* Card */}
                <div className="bg-card rounded-2xl border border-border shadow-sm p-8">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        {/* Step 1 — Professional Info */}
                        {step === 1 && (
                            <div className="space-y-5">
                                <StepHeader
                                    icon={<Stethoscope size={18} />}
                                    title="Professional Information"
                                    subtitle="Tell us about your medical specialty"
                                />
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-widest text-t3 mb-2">
                                        Specialization
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Cardiology, Dermatology..."
                                        {...register("specialization", {
                                            required:
                                                "Specialization is required",
                                        })}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-border text-sm text-t1 bg-page focus:outline-none focus:border-[#185FA5] transition-colors placeholder:text-t3"
                                    />
                                    {errors.specialization && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.specialization.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 2 — License Details */}
                        {step === 2 && (
                            <div className="space-y-5">
                                <StepHeader
                                    icon={<FileText size={18} />}
                                    title="License Details"
                                    subtitle="Enter your medical license information"
                                />
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-widest text-t3 mb-2">
                                        License Number
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. LIC-2024-001"
                                        {...register("licenseNumber", {
                                            required:
                                                "License number is required",
                                        })}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-border text-sm text-t1 bg-page focus:outline-none focus:border-[#185FA5] transition-colors placeholder:text-t3"
                                    />
                                    {errors.licenseNumber && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.licenseNumber.message}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-widest text-t3 mb-2">
                                        License Expiry Date
                                    </label>
                                    <input
                                        type="date"
                                        {...register("licenseExpiryDate")}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-border text-sm text-t1 bg-page focus:outline-none focus:border-[#185FA5] transition-colors"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 3 — Documents */}
                        {step === 3 && (
                            <div className="space-y-5">
                                <StepHeader
                                    icon={<IdCard size={18} />}
                                    title="Upload Documents"
                                    subtitle="Upload clear photos of your documents"
                                />
                                <FileUpload
                                    label="Personal Identity Photo"
                                    preview={idPhotoPreview}
                                    onFileChange={(e) =>
                                        handleFileChange(e, "id")
                                    }
                                    onRemove={() => removeFile("id")}
                                    required
                                />
                                <FileUpload
                                    label="Medical License"
                                    preview={licensePreview}
                                    onFileChange={(e) =>
                                        handleFileChange(e, "license")
                                    }
                                    onRemove={() => removeFile("license")}
                                    required
                                />
                            </div>
                        )}

                        {/* Navigation buttons */}
                        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                            {step > 1 ? (
                                <button
                                    type="button"
                                    onClick={() => setStep((s) => s - 1)}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-t2 bg-subtle border border-border hover:bg-card transition-colors"
                                >
                                    <ChevronLeft size={16} />
                                    Back
                                </button>
                            ) : (
                                <div />
                            )}

                            {step < 3 ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
                                    style={{ background: "#185FA5" }}
                                >
                                    Next
                                    <ChevronRight size={16} />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                                    style={{ background: "#185FA5" }}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2
                                                size={16}
                                                className="animate-spin"
                                            />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 size={16} />
                                            Submit for Review
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                <p className="text-center text-xs text-t3 mt-4">
                    Your information is reviewed by our admin team within 24
                    hours.
                </p>
            </div>
        </div>
    );
}

/* ── Helpers ── */

function StepHeader({ icon, title, subtitle }) {
    return (
        <div className="flex items-start gap-3 mb-2">
            <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: "rgba(24,95,165,0.1)", color: "#185FA5" }}
            >
                {icon}
            </div>
            <div>
                <h2 className="text-base font-bold text-t1">{title}</h2>
                <p className="text-xs text-t2 mt-0.5">{subtitle}</p>
            </div>
        </div>
    );
}

function FileUpload({ label, preview, onFileChange, onRemove, required }) {
    return (
        <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-t3 mb-2">
                {label} {required && <span className="text-red-400">*</span>}
            </label>
            {preview ? (
                <div className="relative rounded-xl overflow-hidden border-2 border-[#185FA5] bg-subtle">
                    <img
                        src={preview}
                        alt={label}
                        className="w-full h-36 object-cover"
                    />
                    <button
                        type="button"
                        onClick={onRemove}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
                    >
                        <X size={14} className="text-white" />
                    </button>
                </div>
            ) : (
                <label className="flex flex-col items-center justify-center gap-2 w-full h-36 rounded-xl border-2 border-dashed border-border bg-subtle hover:border-[#185FA5] hover:bg-blue-50/30 transition-colors cursor-pointer">
                    <Upload size={22} className="text-t3" />
                    <span className="text-xs text-t2 font-medium">
                        Click to upload
                    </span>
                    <span className="text-xs text-t3">PNG, JPG up to 5MB</span>
                    <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={onFileChange}
                        className="hidden"
                    />
                </label>
            )}
        </div>
    );
}
