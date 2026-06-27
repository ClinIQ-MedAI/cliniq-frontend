import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { Clock, XCircle, RefreshCw, LogOut, Mail, Loader2 } from "lucide-react";
import api from "../apis/api";
import API_ENDPOINTS from "../apis/endpoints";

export default function VerificationStatus() {
    const { user, loginData } = useUser();
    const navigate = useNavigate();
    const [status, setStatus] = useState(user?.doctorStatus);
    const [rejectionReason, setRejectionReason] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStatus() {
            try {
                const res = await api.get(API_ENDPOINTS.getOrUpdateMe);
                const currentStatus = res.data.status ?? res.data.doctorStatus;
                setStatus(currentStatus);
                setRejectionReason(res.data.rejectionReason ?? null);

                if (currentStatus === "ACTIVE") {
                    navigate("/doctor-dashboard");
                }
            } catch (err) {
                console.error("Failed to fetch doctor status", err);
            } finally {
                setLoading(false);
            }
        }
        fetchStatus();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-page flex items-center justify-center">
                <Loader2
                    size={32}
                    className="animate-spin"
                    style={{ color: "#185FA5" }}
                />
            </div>
        );
    }

    const handleLogout = () => {
        localStorage.removeItem("cliniq_user");
        localStorage.removeItem("cliniq_token");
        navigate("/");
    };

    const handleReapply = () => {
        navigate("/survey");
    };

    return (
        <div className="min-h-screen bg-page flex items-center justify-center p-6">
            <div className="w-full max-w-md text-center">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                    {status === "PENDING_VERIFICATION" ? (
                        <div
                            className="w-20 h-20 rounded-full flex items-center justify-center"
                            style={{ background: "rgba(24,95,165,0.1)" }}
                        >
                            <Clock size={38} style={{ color: "#185FA5" }} />
                        </div>
                    ) : (
                        <div className="w-20 h-20 rounded-full flex items-center justify-center bg-red-50">
                            <XCircle size={38} className="text-red-500" />
                        </div>
                    )}
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-t1 mb-2">
                    {status === "PENDING_VERIFICATION"
                        ? "Under Review"
                        : "Application Rejected"}
                </h1>

                {/* Subtitle */}
                <p className="text-sm text-t2 leading-relaxed mb-8">
                    {status === "PENDING_VERIFICATION" ? (
                        <>
                            Your credentials have been submitted and are
                            currently being reviewed by our admin team. This
                            usually takes{" "}
                            <span className="font-semibold text-t1">
                                up to 24 hours
                            </span>
                            . We'll notify you once the review is complete.
                        </>
                    ) : (
                        <>
                            Unfortunately, your application was not approved.
                            Please review the reason below and resubmit with the
                            correct information.
                        </>
                    )}
                </p>

                {/* Rejection reason card */}
                {status === "REJECTED" && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-8 text-left">
                        <p className="text-xs font-semibold uppercase tracking-widest text-red-400 mb-2">
                            Reason for Rejection
                        </p>
                        <p className="text-sm text-red-700 leading-relaxed">
                            {rejectionReason ??
                                "Your submitted documents could not be verified. Please ensure your license and identity photos are clear and valid."}
                        </p>
                    </div>
                )}

                {/* Pending info card */}
                {status === "PENDING_VERIFICATION" && (
                    <div className="bg-card border border-border rounded-2xl p-5 mb-8 text-left space-y-3">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ background: "rgba(24,95,165,0.1)" }}
                            >
                                <Mail size={15} style={{ color: "#185FA5" }} />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-t1">
                                    Email Notification
                                </p>
                                <p className="text-xs text-t2 mt-0.5">
                                    You'll receive an email at{" "}
                                    <span className="font-medium text-t1">
                                        {user?.email}
                                    </span>{" "}
                                    once your account is approved.
                                </p>
                            </div>
                        </div>

                        {/* Progress dots */}
                        <div className="flex items-center gap-2 pt-1">
                            {["Submitted", "Under Review", "Decision"].map(
                                (label, i) => (
                                    <div
                                        key={label}
                                        className="flex items-center gap-2 flex-1"
                                    >
                                        <div className="flex flex-col items-center gap-1 flex-1">
                                            <div
                                                className={`w-2.5 h-2.5 rounded-full ${
                                                    i === 0
                                                        ? "bg-emerald-400"
                                                        : i === 1
                                                          ? "animate-pulse"
                                                          : "bg-border"
                                                }`}
                                                style={
                                                    i === 1
                                                        ? {
                                                              background:
                                                                  "#185FA5",
                                                          }
                                                        : {}
                                                }
                                            />
                                            <span className="text-xs text-t3 whitespace-nowrap">
                                                {label}
                                            </span>
                                        </div>
                                        {i < 2 && (
                                            <div className="h-px flex-1 bg-border mb-4" />
                                        )}
                                    </div>
                                ),
                            )}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-3">
                    {status === "REJECTED" && (
                        <button
                            onClick={handleReapply}
                            className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
                            style={{ background: "#185FA5" }}
                        >
                            <RefreshCw size={16} />
                            Reapply Now
                        </button>
                    )}

                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl text-sm font-medium text-t2 bg-card border border-border hover:bg-subtle transition-colors"
                    >
                        <LogOut size={16} />
                        Sign Out
                    </button>
                </div>

                <p className="text-xs text-t3 mt-6">
                    Need help?{" "}
                    <a
                        href="mailto:support@cliniq.com"
                        className="underline hover:text-t2 transition-colors"
                    >
                        Contact support
                    </a>
                </p>
            </div>
        </div>
    );
}
