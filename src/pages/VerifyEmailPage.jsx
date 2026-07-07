// src/features/auth/pages/VerifyEmailPage.tsx
//
// الاستخدام: بعد نجاح الـ register، بتعمل navigate("/verify-email", { state: { email } })

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useOtpTimer } from "../hooks/useOtpTimer";
import api from "../apis/api";
import API_ENDPOINTS from "../apis/endpoints";
import toast from "react-hot-toast";
import { OtpInput } from "../components/OtpTimter";

export function VerifyEmailPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [hasError, setHasError] = useState(false);
    const { secondsLeft, canResend, restart } = useOtpTimer(60);

    useEffect(() => {
        if (!email) {
            toast.error("محتاج تسجل الأول");
            navigate("/", { replace: true });
        }
    }, [email, navigate]);

    useEffect(() => {
        if (!email) return;
        api.post(API_ENDPOINTS.Auth.sendEmailOtp, { email }).catch(() => {
            toast.error("حصل خطأ في إرسال الكود، جرب تاني");
        });
    }, [email]);

    const handleComplete = async (code) => {
        if (!email) return;
        setIsSubmitting(true);
        setHasError(false);
        try {
            await api.post(API_ENDPOINTS.Auth.verifyEmail, { email, code });
            toast.success("تم التحقق من الإيميل بنجاح");
            navigate("/", { replace: true });
        } catch (err) {
            setHasError(true);
            toast.error("الكود غلط أو منتهي، جرب تاني");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResend = async () => {
        if (!email || !canResend) return;
        setIsResending(true);
        try {
            await api.post(API_ENDPOINTS.Auth.sendEmailOtp, { email });
            restart(60);
            toast.success("اتبعت كود جديد");
        } catch {
            toast.error("مقدرناش نبعت الكود، جرب تاني");
        } finally {
            setIsResending(false);
        }
    };

    if (!email) return null;

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-sm text-center space-y-6">
                <div className="space-y-2">
                    <h1 className="text-xl font-medium text-foreground">
                        تأكيد الإيميل
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        بعتنا كود مكون من 6 أرقام على{" "}
                        <span className="text-foreground">{email}</span>
                    </p>
                </div>

                <OtpInput
                    onComplete={handleComplete}
                    disabled={isSubmitting}
                    error={hasError}
                />

                <button
                    type="button"
                    onClick={handleResend}
                    disabled={!canResend || isResending}
                    className="text-sm text-primary disabled:text-muted-foreground disabled:cursor-not-allowed"
                >
                    {canResend
                        ? "إعادة إرسال الكود"
                        : `إعادة الإرسال بعد ${secondsLeft} ثانية`}
                </button>
            </div>
        </div>
    );
}
