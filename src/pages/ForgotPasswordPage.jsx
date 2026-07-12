import { Mail, ArrowLeft, KeyRound } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../apis/api";
import API_ENDPOINTS from "../apis/endpoints";

export const ForgotPasswordPage = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [error, setError] = useState();
    const [success, setSuccess] = useState(null);
    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        debugger;
        if (!data.email) {
            setError({ email: "email is required" });
            return;
        }
        setLoading(true);
        setError({});
        try {
            await api.post(API_ENDPOINTS.Auth.forgotPassword, data);
            setSuccess(true);
            navigate("/reset-password", { state: { email: data.email } });
        } catch (error) {
            setError({
                global: error.response?.data?.message || "Something went wrong",
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
                            Forgot Password ?
                        </h1>
                        <p className="text-t2 text-sm mt-2 leading-relaxed">
                            need details in your account? send your email and we
                            will send you link to reset password
                        </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
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
                                    placeholder="example@email.com"
                                    className="w-full bg-subtle border border-border-sub rounded-xl py-2.5 ps-10 pe-3 text-sm text-t1 placeholder:text-t3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition"
                                />
                            </div>
                            {/* Error message مكانها هنا لو فيه validation */}
                            {error?.email && <p>{error.email}</p>}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-white rounded-xl py-2.5 text-sm font-medium hover:opacity-90 active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            send reset mail
                        </button>
                    </form>

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
