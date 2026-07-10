import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    FileImage,
    Pill,
    Loader2,
    Check,
    ArrowLeft,
    AlertCircle,
} from "lucide-react";
import API_ENDPOINTS from "../apis/endpoints";
import { useUser } from "../contexts/UserContext";
// Reuses the same card/layout classes as Dashboard.css (db-root, db-card, etc.)
// Adjust the import path below if this file lives somewhere else.
import "../components/Dashboard/Dashboard.css";
import api from "../apis/api";

/* ---------- helpers ---------- */
const STATUS_STYLES = {
    Pending: "bg-yellow-100 text-yellow-700",
    completed: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
    rejected: "bg-orange-100 text-orange-700",
};

const StatusPill = ({ status }) => (
    <span
        className={`text-xs font-medium px-2 py-1 rounded-full ${
            STATUS_STYLES[status] ?? "bg-gray-100 text-gray-600"
        }`}
    >
        {status ?? "Unknown"}
    </span>
);

const formatDate = (iso) =>
    iso
        ? new Date(iso).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
          })
        : "";

/* ---------- list row ---------- */
const DocRow = ({ icon: Icon, title, subtitle, status, reviewed, onClick }) => (
    <button
        onClick={onClick}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-card hover:border-primary/40 hover:bg-subtle/40 transition-colors text-left"
    >
        <div className="w-10 h-10 rounded-lg bg-subtle flex items-center justify-center text-primary shrink-0">
            <Icon size={18} />
        </div>
        <div className="flex-1 min-w-0">
            <div className="font-medium text-t1 truncate">{title}</div>
            <div className="text-sm text-t3">{subtitle}</div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
            <StatusPill status={status} />
            {reviewed ? (
                <span className="text-xs text-green-600 flex items-center gap-1">
                    <Check size={12} /> Reviewed
                </span>
            ) : (
                <span className="text-xs text-t3">Awaiting review</span>
            )}
        </div>
    </button>
);
const AIResultView = ({ scan }) => {
    const result = scan.aiAnalysisResult;
    if (!result)
        return <div className="text-sm text-t3">No result available.</div>;

    const overlayImage =
        result.annotated_image_base64 ?? result.gradcam_image_base64 ?? null;

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${URGENCY_META[result.urgency]?.pill ?? "bg-gray-100 text-gray-600"}`}
                >
                    {URGENCY_META[result.urgency]?.label ?? result.urgency}
                </span>
                {result.body_part && (
                    <span className="text-xs text-t3">{result.body_part}</span>
                )}
            </div>

            <p className="text-sm text-t1">{result.summary}</p>

            {/* --- خاص بـ BONE --- */}
            {result.has_fracture !== undefined && (
                <div className="flex flex-wrap gap-2">
                    <FindingFlag label="Fracture" value={result.has_fracture} />
                    <FindingFlag label="Hardware" value={result.has_hardware} />
                    <FindingFlag
                        label="Healing signs"
                        value={result.has_healing_signs}
                    />
                </div>
            )}

            {/* --- خاص بـ CHEST --- */}
            {result.ai_findings && (
                <div className="bg-subtle rounded-lg p-3 text-sm">
                    <div className="font-medium text-t1">
                        {result.ai_findings.primary_diagnosis} (
                        {result.ai_findings.confidence})
                    </div>
                    <div className="text-t2 text-xs mt-1">
                        Severity: {result.ai_findings.severity} —{" "}
                        {result.ai_findings.clinical_meaning}
                    </div>
                </div>
            )}

            {result.differential_diagnoses?.length > 0 && (
                <div>
                    <div className="text-xs font-medium text-t2 mb-1">
                        Differential diagnoses
                    </div>
                    <ul className="text-sm text-t2 space-y-0.5">
                        {result.differential_diagnoses.map((d, i) => (
                            <li key={i}>
                                {d.condition} — {d.probability}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* --- مشترك: توصيات --- */}
            {result.recommendations?.length > 0 && (
                <ul className="text-sm text-t2 list-disc pl-4 space-y-1">
                    {result.recommendations.map((r, i) => (
                        <li key={i}>{r}</li>
                    ))}
                </ul>
            )}

            {/* --- مشترك: الصورة المُعلَّمة (اسم مختلف حسب الـ modality) --- */}
            {overlayImage && (
                <div>
                    <div className="text-xs text-t3 mb-1">
                        {result.gradcam_image_base64
                            ? "Model attention (Grad-CAM)"
                            : "Annotated image"}
                    </div>
                    <img
                        src={`data:image/png;base64,${overlayImage}`}
                        alt="AI overlay"
                        className="w-full max-h-96 object-contain rounded-lg border border-border"
                    />
                </div>
            )}

            <details className="text-xs text-t3">
                <summary className="cursor-pointer">Raw AI response</summary>
                <pre className="bg-subtle rounded-lg p-3 overflow-x-auto whitespace-pre-wrap mt-1">
                    {JSON.stringify(result, null, 2)}
                </pre>
            </details>
        </div>
    );
};
const URGENCY_META = {
    ROUTINE: { label: "Routine", pill: "bg-green-100 text-green-700" },
    URGENT: { label: "Urgent", pill: "bg-orange-100 text-orange-700" },
    CRITICAL: { label: "Critical", pill: "bg-red-100 text-red-700" },
    REJECTED: { label: "Rejected", pill: "bg-gray-100 text-gray-600" },
};

const FindingFlag = ({ label, value }) => (
    <span
        className={`text-xs px-2 py-1 rounded-full ${value ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-500"}`}
    >
        {value ? "✓" : "—"} {label}
    </span>
);

/* ---------- scan detail panel ---------- */
const ScanDetail = ({ scan, onBack, onReviewed }) => {
    const { user } = useUser();
    const [notes, setNotes] = useState(scan.doctorNotes ?? "");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // TODO: confirm the real field name for the logged-in doctor's DoctorProfile.Id
    const doctorId = user?.user?.doctorId ?? user?.doctorId;

    const handleReview = async () => {
        setError("");
        if (!doctorId) {
            setError("Could not determine your doctor profile ID.");
            return;
        }
        setSaving(true);
        try {
            await api.post(API_ENDPOINTS.Doctor.Scans.review(scan.id), {
                doctorId,
                doctorNotes: notes,
            });
            onReviewed();
        } catch (err) {
            setError(
                err?.response?.data?.title ??
                    err?.response?.data?.message ??
                    "Failed to save review",
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="db-card">
            <button
                onClick={onBack}
                className="flex items-center gap-1 text-sm text-t3 hover:text-primary mb-4"
            >
                <ArrowLeft size={14} /> Back to list
            </button>

            <div className="flex items-start justify-between mb-4">
                <div>
                    <div className="db-card-title mb-1">
                        {scan.modality} scan — {scan.patientName}
                    </div>
                    <div className="text-sm text-t3">
                        Uploaded {formatDate(scan.createdAt)}
                    </div>
                </div>
                <StatusPill status={scan.aiJobStatus} />
            </div>

            <div className="mb-4">
                <div className="text-sm font-medium text-t1 mb-2">
                    AI analysis result
                </div>
                {scan.aiJobStatus === "rejected" ? (
                    <div className="text-sm text-red-600 flex items-center gap-2">
                        <AlertCircle size={14} />
                        {scan.aiAnalysisResult?.input_gate?.reason ??
                            "Image rejected by quality gate."}
                    </div>
                ) : scan.aiJobStatus === "needs_review" ? (
                    <div className="space-y-2">
                        <div className="text-sm text-orange-600 flex items-center gap-2 bg-orange-50 rounded-lg p-2">
                            <AlertCircle size={14} />
                            {scan.aiAnalysisResult?.input_gate?.reason ??
                                "Flagged for manual review."}
                        </div>
                        <AIResultView scan={scan} />
                    </div>
                ) : (
                    <AIResultView scan={scan} />
                )}
            </div>

            <div className="mb-4">
                <label className="text-sm font-medium text-t1 mb-1 block">
                    Doctor notes
                </label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className="w-full border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="Add your findings or notes for this scan..."
                />
            </div>

            {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 mb-3">
                    <AlertCircle size={14} /> {error}
                </div>
            )}

            <button
                onClick={handleReview}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-medium hover:opacity-90 disabled:opacity-60"
            >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {scan.isReviewed ? "Update review" : "Mark as reviewed"}
            </button>
        </div>
    );
};

/* ---------- prescription detail panel ---------- */
const PrescriptionDetail = ({ prescription, onBack, onConfirmed }) => {
    const { user } = useUser();
    const [notes, setNotes] = useState(prescription.doctorNotes ?? "");
    const [medsText, setMedsText] = useState(
        JSON.stringify(prescription.medications ?? [], null, 2),
    );
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // TODO: confirm the real field name for the logged-in doctor's DoctorProfile.Id
    const doctorId = user?.user?.doctorId ?? user?.doctorId;

    const handleConfirm = async () => {
        setError("");
        if (!doctorId) {
            setError("Could not determine your doctor profile ID.");
            return;
        }
        let medications;
        try {
            medications = JSON.parse(medsText);
        } catch {
            setError("Medications must be valid JSON.");
            return;
        }
        setSaving(true);
        try {
            await api.post(
                API_ENDPOINTS.Doctor.Prescriptions.confirm(prescription.id),
                { doctorId, medications, doctorNotes: notes },
            );
            onConfirmed();
        } catch (err) {
            setError(
                err?.response?.data?.title ??
                    err?.response?.data?.message ??
                    "Failed to confirm prescription",
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="db-card">
            <button
                onClick={onBack}
                className="flex items-center gap-1 text-sm text-t3 hover:text-primary mb-4"
            >
                <ArrowLeft size={14} /> Back to list
            </button>

            <div className="flex items-start justify-between mb-4">
                <div>
                    <div className="db-card-title mb-1">
                        Prescription — {prescription.patientName}
                    </div>
                    <div className="text-sm text-t3">
                        Uploaded {formatDate(prescription.createdAt)}
                    </div>
                </div>
                <StatusPill status={prescription.aiJobStatus} />
            </div>

            {(prescription.prescriptionImageUrl ||
                prescription.prescriptionImageBase64) && (
                <img
                    src={
                        prescription.prescriptionImageUrl ??
                        `data:image/png;base64,${prescription.prescriptionImageBase64}`
                    }
                    alt="Prescription"
                    className="w-full max-h-96 object-contain rounded-lg border border-border bg-subtle mb-4"
                />
            )}

            <div className="mb-4">
                <div className="text-sm font-medium text-t1 mb-2">
                    AI parsed text
                </div>
                {prescription.aiJobStatus === "Pending" ? (
                    <div className="flex items-center gap-2 text-sm text-t3">
                        <Loader2 size={14} className="animate-spin" />
                        Still processing — check back shortly.
                    </div>
                ) : prescription.rawParsedText ? (
                    <pre className="text-xs bg-subtle rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(prescription.rawParsedText, null, 2)}
                    </pre>
                ) : (
                    <div className="text-sm text-t3">No result available.</div>
                )}
            </div>

            <div className="mb-4">
                <label className="text-sm font-medium text-t1 mb-1 block">
                    Medications (editable)
                </label>
                <textarea
                    value={medsText}
                    onChange={(e) => setMedsText(e.target.value)}
                    rows={6}
                    className="w-full border border-border rounded-lg p-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <p className="text-xs text-t3 mt-1">
                    Review what the AI extracted and correct it before
                    confirming.
                </p>
            </div>

            <div className="mb-4">
                <label className="text-sm font-medium text-t1 mb-1 block">
                    Doctor notes
                </label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="Add any notes for this prescription..."
                />
            </div>

            {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 mb-3">
                    <AlertCircle size={14} /> {error}
                </div>
            )}

            <button
                onClick={handleConfirm}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-medium hover:opacity-90 disabled:opacity-60"
            >
                {saving && <Loader2 size={14} className="animate-spin" />}
                Confirm prescription
            </button>
        </div>
    );
};

/* ---------- main page ---------- */
export default function PatientDocuments() {
    const { patientId } = useParams();
    const navigate = useNavigate();
    const [tab, setTab] = useState("scans");
    const [scans, setScans] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedScanId, setSelectedScanId] = useState(null);
    const [selectedPrescriptionId, setSelectedPrescriptionId] = useState(null);

    const fetchData = useCallback(async () => {
        if (!patientId) return;
        setLoading(true);
        setError("");
        try {
            const [scansRes, prescriptionsRes] = await Promise.all([
                api.get(API_ENDPOINTS.Doctor.Scans.getByPatient(patientId)),
                api.get(
                    API_ENDPOINTS.Doctor.Prescriptions.getByPatient(patientId),
                ),
            ]);
            setScans(scansRes.data ?? []);
            setPrescriptions(prescriptionsRes.data ?? []);
        } catch (err) {
            setError(
                err?.response?.data?.title ??
                    err?.response?.data?.message ??
                    "Failed to load documents",
            );
        } finally {
            setLoading(false);
        }
    }, [patientId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const selectedScan = scans.find((s) => s.id === selectedScanId);
    const selectedPrescription = prescriptions.find(
        (p) => p.id === selectedPrescriptionId,
    );

    const patientName =
        scans[0]?.patientName ?? prescriptions[0]?.patientName ?? "Patient";

    return (
        <div className="db-root">
            <title>Patient Documents - ClinIQ</title>

            <div className="db-welcome">
                <div>
                    <button
                        onClick={() => navigate("/appointments")}
                        className="flex items-center gap-1 text-sm text-t3 hover:text-primary mb-2"
                    >
                        <ArrowLeft size={14} /> Back to patients
                    </button>
                    <h1 className="db-welcome-name">{patientName}</h1>
                    <p className="db-welcome-sub">
                        AI-uploaded scans and prescriptions awaiting your review
                    </p>
                </div>
            </div>

            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => setTab("scans")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        tab === "scans"
                            ? "bg-primary text-white"
                            : "bg-subtle text-t2 hover:text-primary"
                    }`}
                >
                    <span className="inline-flex items-center gap-2">
                        <FileImage size={15} /> Scans ({scans.length})
                    </span>
                </button>
                <button
                    onClick={() => setTab("prescriptions")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        tab === "prescriptions"
                            ? "bg-primary text-white"
                            : "bg-subtle text-t2 hover:text-primary"
                    }`}
                >
                    <span className="inline-flex items-center gap-2">
                        <Pill size={15} /> Prescriptions ({prescriptions.length}
                        )
                    </span>
                </button>
            </div>

            {loading ? (
                <div className="flex items-center gap-2 text-sm text-t2 py-8">
                    <Loader2 size={16} className="animate-spin" />
                    Loading documents...
                </div>
            ) : error ? (
                <div className="flex items-center gap-2 text-sm text-red-600 py-8">
                    <AlertCircle size={15} /> {error}
                </div>
            ) : tab === "scans" ? (
                selectedScan ? (
                    <ScanDetail
                        scan={selectedScan}
                        onBack={() => setSelectedScanId(null)}
                        onReviewed={() => {
                            setSelectedScanId(null);
                            fetchData();
                        }}
                    />
                ) : scans.length === 0 ? (
                    <p className="text-sm text-t3 py-8">
                        No scans uploaded by this patient yet.
                    </p>
                ) : (
                    <div className="space-y-2">
                        {scans.map((scan) => (
                            <DocRow
                                key={scan.id}
                                icon={FileImage}
                                title={`${scan.modality} scan`}
                                subtitle={formatDate(scan.createdAt)}
                                status={scan.aiJobStatus}
                                reviewed={scan.isReviewed}
                                onClick={() => setSelectedScanId(scan.id)}
                            />
                        ))}
                    </div>
                )
            ) : selectedPrescription ? (
                <PrescriptionDetail
                    prescription={selectedPrescription}
                    onBack={() => setSelectedPrescriptionId(null)}
                    onConfirmed={() => {
                        setSelectedPrescriptionId(null);
                        fetchData();
                    }}
                />
            ) : prescriptions.length === 0 ? (
                <p className="text-sm text-t3 py-8">
                    No prescriptions uploaded by this patient yet.
                </p>
            ) : (
                <div className="space-y-2">
                    {prescriptions.map((p) => (
                        <DocRow
                            key={p.id}
                            icon={Pill}
                            title="Prescription"
                            subtitle={formatDate(p.createdAt)}
                            status={p.aiJobStatus}
                            reviewed={!!p.doctorId}
                            onClick={() => setSelectedPrescriptionId(p.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
