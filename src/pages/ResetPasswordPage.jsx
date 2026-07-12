import { KeyRound, Mail, ArrowLeft, Lock, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../apis/api";
import API_ENDPOINTS from "../apis/endpoints";

export const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const emailFromState = location.state?.email || "";

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState({});
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        const newErrors = {};
        if (!data.email) newErrors.email = "email is required";
        if (!data.code) newErrors.code = "OTP code is required";
        if (!data.newPassword)
            newErrors.newPassword = "new password is required";
        if (data.newPassword && data.newPassword.length < 8) {
            newErrors.newPassword = "password must be at least 8 characters";
        }
        if (data.newPassword !== data.confirmPassword) {
            newErrors.confirmPassword = "passwords do not match";
        }

        if (Object.keys(newErrors).length > 0) {
            setError(newErrors);
            return;
        }

        setLoading(true);
        setError({});
        try {
            await api.post(API_ENDPOINTS.Auth.resetPassword, {
                email: data.email,
                code: data.code,
                newPassword: data.newPassword,
            });
            setSuccess(true);
            setTimeout(() => navigate("/login"), 1500);
        } catch (err) {
            setError({
                global:
                    err.response?.data?.message ||
                    "Something went wrong. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-page flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Logo / Brand */}
                <div className="flex justify-center mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <KeyRound className="w-7 h-7 text-primary" />
                    </div>
                </div>

                {/* Card */}
                <div className="bg-card border border-border rounded-2xl shadow-sm p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-semibold text-t1">
                            Reset Password
                        </h1>
                        <p className="text-t2 text-sm mt-2 leading-relaxed">
                            enter the code we sent to your email along with your
                            new password
                        </p>
                    </div>

                    {success ? (
                        <div className="text-center py-4">
                            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                                <ShieldCheck className="w-6 h-6 text-primary" />
                            </div>
                            <p className="text-t1 text-sm font-medium">
                                Password reset successfully
                            </p>
                            <p className="text-t2 text-xs mt-1">
                                Redirecting you to login...
                            </p>
                        </div>
                    ) : (
                        <form className="space-y-5" onSubmit={handleSubmit}>
                            {error?.global && (
                                <p className="text-sm text-red-500 text-center">
                                    {error.global}
                                </p>
                            )}

                            {/* Email Field */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-t1 mb-1.5"
                                >
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className="w-4.5 h-4.5 text-t3 absolute top-1/2 -translate-y-1/2 start-3" />
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        defaultValue={emailFromState}
                                        readOnly={!!emailFromState}
                                        placeholder="example@email.com"
                                        className="w-full bg-subtle border border-border-sub rounded-xl py-2.5 ps-10 pe-3 text-sm text-t1 placeholder:text-t3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition read-only:opacity-70"
                                    />
                                </div>
                                {error?.email && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {error.email}
                                    </p>
                                )}
                            </div>

                            {/* OTP Code Field */}
                            <div>
                                <label
                                    htmlFor="code"
                                    className="block text-sm font-medium text-t1 mb-1.5"
                                >
                                    OTP Code
                                </label>
                                <div className="relative">
                                    <ShieldCheck className="w-4.5 h-4.5 text-t3 absolute top-1/2 -translate-y-1/2 start-3" />
                                    <input
                                        id="code"
                                        type="text"
                                        name="code"
                                        inputMode="numeric"
                                        autoComplete="one-time-code"
                                        placeholder="6-digit code"
                                        className="w-full bg-subtle border border-border-sub rounded-xl py-2.5 ps-10 pe-3 text-sm text-t1 placeholder:text-t3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition"
                                    />
                                </div>
                                {error?.code && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {error.code}
                                    </p>
                                )}
                            </div>

                            {/* New Password Field */}
                            <div>
                                <label
                                    htmlFor="newPassword"
                                    className="block text-sm font-medium text-t1 mb-1.5"
                                >
                                    New Password
                                </label>
                                <div className="relative">
                                    <Lock className="w-4.5 h-4.5 text-t3 absolute top-1/2 -translate-y-1/2 start-3" />
                                    <input
                                        id="newPassword"
                                        type="password"
                                        name="newPassword"
                                        placeholder="••••••••"
                                        className="w-full bg-subtle border border-border-sub rounded-xl py-2.5 ps-10 pe-3 text-sm text-t1 placeholder:text-t3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition"
                                    />
                                </div>
                                {error?.newPassword && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {error.newPassword}
                                    </p>
                                )}
                            </div>

                            {/* Confirm Password Field */}
                            <div>
                                <label
                                    htmlFor="confirmPassword"
                                    className="block text-sm font-medium text-t1 mb-1.5"
                                >
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <Lock className="w-4.5 h-4.5 text-t3 absolute top-1/2 -translate-y-1/2 start-3" />
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        name="confirmPassword"
                                        placeholder="••••••••"
                                        className="w-full bg-subtle border border-border-sub rounded-xl py-2.5 ps-10 pe-3 text-sm text-t1 placeholder:text-t3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition"
                                    />
                                </div>
                                {error?.confirmPassword && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {error.confirmPassword}
                                    </p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary text-white rounded-xl py-2.5 text-sm font-medium hover:opacity-90 active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {loading ? "Resetting..." : "Reset Password"}
                            </button>
                        </form>
                    )}

                    {/* Back to login */}
                    <div className="mt-6 text-center">
                        <Link
                            to="/"
                            className="inline-flex items-center gap-1.5 text-sm text-t2 hover:text-primary transition"
                        >
                            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                            return to login page
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
