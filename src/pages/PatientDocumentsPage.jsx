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
    pending: "bg-yellow-100 text-yellow-700",
    completed: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
    rejected: "bg-orange-100 text-orange-700",
    needs_review: "bg-orange-100 text-orange-700",
};

const StatusPill = ({ status }) => {
    const key = status?.toLowerCase();
    return (
        <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${
                STATUS_STYLES[key] ?? "bg-gray-100 text-gray-600"
            }`}
        >
            {status ?? "Unknown"}
        </span>
    );
};

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

/* ---------- one extracted medication (success shape) ---------- */
const MedicationCard = ({ med }) => {
    const arabicLine = [med.dosage, med.schedule_ar ?? med.frequency]
        .filter(Boolean)
        // dosage and schedule_ar/frequency are sometimes identical strings —
        // don't repeat the same text twice
        .filter((v, i, arr) => arr.indexOf(v) === i)
        .join(" · ");

    return (
        <div className="border border-border rounded-lg p-3 bg-card">
            <div className="flex items-start justify-between gap-2">
                <div className="font-medium text-t1 text-sm">
                    {med.drug_extracted ?? med.drug ?? "Unknown medication"}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                    {med.official_match === true ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                            <Check size={11} /> Verified
                        </span>
                    ) : med.official_match === false ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                            <AlertCircle size={11} /> Not matched
                        </span>
                    ) : null}
                    {typeof med.confidence_score === "number" && (
                        <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                med.confidence_score >= 85
                                    ? "bg-green-100 text-green-700"
                                    : med.confidence_score >= 60
                                      ? "bg-amber-100 text-amber-700"
                                      : "bg-red-100 text-red-700"
                            }`}
                        >
                            {med.confidence_score}%
                        </span>
                    )}
                </div>
            </div>
            {arabicLine && (
                <div dir="rtl" className="text-sm text-t2 mt-1.5 text-right">
                    {arabicLine}
                </div>
            )}
        </div>
    );
};

/* ---------- prescription AI result: the backend response comes in two shapes ----------
   Failure shape:
     { success: false, image_type, error, detections: [], ai_findings: {},
       input_gate: { passed, action, reason, scores: {...} } }
   Success shape (note: the useful fields live INSIDE ai_findings, not top-level):
     { success: true, image_type, detections: [],
       ai_findings: { primary_diagnosis, medications: [{ drug_extracted, drug,
         dosage, frequency, schedule_ar, confidence_score, official_match }],
         raw_vlm_output, notes },
       report_data: { total_medications, verified_medications, medications },
       input_gate: {...} }
*/
const PrescriptionAIResultView = ({ prescription }) => {
    const result = prescription.rawParsedText;
    if (!result)
        return <div className="text-sm text-t3">No result available.</div>;

    const gate = result.input_gate;
    const findings = result.ai_findings ?? {};
    const report = result.report_data;

    // Prefer the nested ai_findings fields; fall back to top-level in case
    // some other endpoint ever returns this flatter.
    const primaryDiagnosis =
        findings.primary_diagnosis ?? result.primary_diagnosis;
    const medications = Array.isArray(findings.medications)
        ? findings.medications
        : Array.isArray(result.medications)
          ? result.medications
          : [];
    const notes = findings.notes ?? result.notes;
    const hasMedications = medications.length > 0;

    return (
        <div className="space-y-3">
            {result.success === false && (
                <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 rounded-lg p-2.5">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                    <span>
                        AI extraction failed
                        {result.error ? `: ${result.error}` : "."}
                    </span>
                </div>
            )}

            {primaryDiagnosis && (
                <div
                    dir="rtl"
                    className="text-sm text-t1 bg-subtle rounded-lg p-3 text-right leading-relaxed"
                >
                    {primaryDiagnosis}
                </div>
            )}

            <div className="flex flex-wrap items-center gap-2 text-xs">
                {gate && (
                    <span
                        className={`px-2 py-0.5 rounded-full font-medium ${
                            gate.passed
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                        }`}
                    >
                        {gate.passed
                            ? "Passed quality gate"
                            : "Failed quality gate"}
                    </span>
                )}
                {gate?.action && (
                    <span className="text-t3">Action: {gate.action}</span>
                )}
                {gate?.reason && (
                    <span className="text-t3">— {gate.reason}</span>
                )}
                {report && typeof report.total_medications === "number" && (
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                        {report.verified_medications ?? 0}/
                        {report.total_medications} verified
                    </span>
                )}
            </div>

            {hasMedications ? (
                <div className="space-y-2">
                    <div className="text-xs font-medium text-t2">
                        Medications ({medications.length})
                    </div>
                    {medications.map((med, i) => (
                        <MedicationCard key={i} med={med} />
                    ))}
                </div>
            ) : result.detections?.length > 0 ? (
                <div>
                    <div className="text-xs font-medium text-t2 mb-1">
                        Detected items
                    </div>
                    <ul className="text-sm text-t2 list-disc pl-4 space-y-0.5">
                        {result.detections.map((d, i) => (
                            <li key={i}>
                                {typeof d === "string"
                                    ? d
                                    : (d.label ??
                                      d.name ??
                                      d.condition ??
                                      "Unrecognized detection — see raw response")}
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                result.success !== false &&
                !primaryDiagnosis && (
                    <p className="text-sm text-t3">
                        No medications were detected by the AI for this image.
                    </p>
                )
            )}

            {notes && <p className="text-xs text-t3 italic">{notes}</p>}

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

const URGENCY_BANNER_STYLES = {
    CRITICAL: "bg-red-50 border-red-200 text-red-700",
    URGENT: "bg-orange-50 border-orange-200 text-orange-700",
};

// Only CRITICAL/URGENT get a banner — routine results don't need to compete
// for attention above the fold.
const UrgencyBanner = ({ urgency }) => {
    const style = URGENCY_BANNER_STYLES[urgency];
    if (!style) return null;
    return (
        <div
            className={`flex items-center gap-2 border rounded-lg px-4 py-3 mb-4 font-medium ${style}`}
        >
            <AlertCircle size={18} className="shrink-0" />
            {URGENCY_META[urgency]?.label ?? urgency} finding — review before
            confirming
        </div>
    );
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

    const doctorId = user?.id;

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

            <UrgencyBanner urgency={scan.aiAnalysisResult?.urgency} />

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

/* ---------- one editable medication row (used in the confirm form) ---------- */
const EditableMedicationRow = ({ med, onChange, onRemove }) => (
    <div className="border border-border rounded-lg p-3 bg-card space-y-2">
        <div className="flex items-center gap-2">
            <input
                value={med.drug_extracted ?? med.drug ?? ""}
                onChange={(e) =>
                    onChange({ ...med, drug_extracted: e.target.value })
                }
                placeholder="Drug name"
                className="flex-1 border border-border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <button
                type="button"
                onClick={onRemove}
                className="text-xs text-red-500 hover:text-red-700 shrink-0 px-2"
            >
                Remove
            </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
            <input
                value={med.dosage ?? ""}
                onChange={(e) => onChange({ ...med, dosage: e.target.value })}
                placeholder="Dosage"
                className="border border-border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <input
                value={med.frequency ?? ""}
                onChange={(e) =>
                    onChange({ ...med, frequency: e.target.value })
                }
                placeholder="Frequency"
                className="border border-border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
        </div>
    </div>
);

/* ---------- prescription detail panel ---------- */
const PrescriptionDetail = ({ prescription, onBack, onConfirmed }) => {
    const { user } = useUser();
    const [notes, setNotes] = useState(prescription.doctorNotes ?? "");
    const [medications, setMedications] = useState(
        prescription.medications ??
            prescription.rawParsedText?.ai_findings?.medications ??
            [],
    );
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const doctorId = user?.id;

    const handleConfirm = async () => {
        setError("");
        if (!doctorId) {
            setError("Could not determine your doctor profile ID.");
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
                {prescription.aiJobStatus?.toLowerCase() === "pending" ? (
                    <div className="flex items-center gap-2 text-sm text-t3">
                        <Loader2 size={14} className="animate-spin" />
                        Still processing — check back shortly.
                    </div>
                ) : (
                    <PrescriptionAIResultView prescription={prescription} />
                )}
            </div>

            <div className="mb-4">
                <label className="text-sm font-medium text-t1 mb-1 block">
                    Medications (editable)
                </label>
                <p className="text-xs text-t3 mb-2">
                    Review what the AI extracted and correct it before
                    confirming.
                </p>
                <div className="space-y-2">
                    {medications.map((med, i) => (
                        <EditableMedicationRow
                            key={i}
                            med={med}
                            onChange={(updated) =>
                                setMedications((prev) =>
                                    prev.map((m, idx) =>
                                        idx === i ? updated : m,
                                    ),
                                )
                            }
                            onRemove={() =>
                                setMedications((prev) =>
                                    prev.filter((_, idx) => idx !== i),
                                )
                            }
                        />
                    ))}
                </div>
                <button
                    type="button"
                    onClick={() =>
                        setMedications((prev) => [
                            ...prev,
                            { drug_extracted: "", dosage: "", frequency: "" },
                        ])
                    }
                    className="mt-2 text-sm text-primary hover:underline"
                >
                    + Add medication
                </button>
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
