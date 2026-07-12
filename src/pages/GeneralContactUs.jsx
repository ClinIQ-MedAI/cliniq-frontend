import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Mail,
    Phone,
    MapPin,
    Clock,
    Send,
    CheckCircle2,
    Loader2,
    ArrowLeft,
} from "lucide-react";
import api from "../apis/api";

// Update these with ClinIQ's real details
const CONTACT_DETAILS = [
    {
        icon: Mail,
        label: "Email",
        value: "support@cliniq.com",
        href: "mailto:support@cliniq.com",
    },
    {
        icon: Phone,
        label: "Phone",
        value: "+20 100 000 0000",
        href: "tel:+201000000000",
    },
    {
        icon: MapPin,
        label: "Address",
        value: "Mansoura, Dakahlia, Egypt",
    },
    {
        icon: Clock,
        label: "Hours",
        value: "Sat – Thu, 9:00 AM – 9:00 PM",
    },
];

const initialForm = {
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
};

function validate(values) {
    const errors = {};
    if (!values.name.trim()) errors.name = "Please enter your name.";
    if (!values.email.trim()) errors.email = "Please enter your email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
        errors.email = "Enter a valid email address.";
    if (!values.subject.trim()) errors.subject = "Please add a subject.";
    if (!values.message.trim()) errors.message = "Please write your message.";
    else if (values.message.trim().length < 10)
        errors.message = "Your message should be at least 10 characters.";
    return errors;
}

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    show: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.06, duration: 0.45, ease: "easeOut" },
    }),
};

export const GeneralContactUs = () => {
    const [values, setValues] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState("");

    const handleChange = (field) => (e) => {
        const val = e.target.value;
        setValues((v) => ({ ...v, [field]: val }));
        if (errors[field]) setErrors((er) => ({ ...er, [field]: undefined }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const nextErrors = validate(values);
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;

        setIsSubmitting(true);
        setSubmitError("");
        try {
            await api.post("/contact-us", {
                name: values.name.trim(),
                email: values.email.trim(),
                phone: values.phone.trim() || null,
                subject: values.subject.trim(),
                message: values.message.trim(),
            });
            setIsSubmitted(true);
        } catch (err) {
            setSubmitError(
                err?.response?.data?.title ??
                    err?.response?.data?.detail ??
                    "Something went wrong sending your message. Please try again.",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setValues(initialForm);
        setErrors({});
        setSubmitError("");
        setIsSubmitted(false);
    };

    return (
        <div className="min-h-screen bg-page">
            <style>{`
                @keyframes pulse-travel {
                    0% { stroke-dashoffset: 240; }
                    100% { stroke-dashoffset: 0; }
                }
                .pulse-path {
                    stroke-dasharray: 240;
                    animation: pulse-travel 3.2s linear infinite;
                }
                @media (prefers-reduced-motion: reduce) {
                    .pulse-path { animation: none; }
                }
            `}</style>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 lg:py-16">
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-sm font-medium text-t2 hover:text-primary transition-colors mb-6 sm:mb-8"
                >
                    <ArrowLeft size={16} />
                    Back to home
                </Link>

                <div className="grid lg:grid-cols-[0.9fr_1.1fr] rounded-2xl sm:rounded-3xl overflow-hidden border border-border shadow-xl">
                    {/* Info panel */}
                    <motion.div
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="relative overflow-hidden bg-primary text-white p-6 sm:p-10 lg:p-12 flex flex-col justify-between"
                    >
                        <div>
                            <span className="text-xs font-semibold tracking-[0.2em] text-white/70 uppercase">
                                Get in touch
                            </span>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-3 leading-tight">
                                We're here to help,
                                <br />
                                whenever you need us
                            </h1>
                            <p className="text-white/80 mt-4 text-sm leading-relaxed max-w-sm">
                                Questions about an appointment, a doctor, or
                                your account? Send us a message and our team
                                will get back to you shortly.
                            </p>
                        </div>

                        <ul className="mt-8 sm:mt-10 space-y-5">
                            {CONTACT_DETAILS.map(
                                ({ icon: Icon, label, value, href }, i) => (
                                    <motion.li
                                        key={label}
                                        custom={i}
                                        variants={fadeUp}
                                        initial="hidden"
                                        animate="show"
                                        className="flex items-start gap-3"
                                    >
                                        <span className="p-2 rounded-lg bg-white/10 shrink-0">
                                            <Icon size={17} />
                                        </span>
                                        <div className="text-sm min-w-0">
                                            <p className="text-white/60">
                                                {label}
                                            </p>
                                            {href ? (
                                                <a
                                                    href={href}
                                                    className="font-medium hover:underline text-white! break-words"
                                                >
                                                    {value}
                                                </a>
                                            ) : (
                                                <p className="font-medium break-words">
                                                    {value}
                                                </p>
                                            )}
                                        </div>
                                    </motion.li>
                                ),
                            )}
                        </ul>

                        {/* Signature: ECG pulse line, on-brand for a clinic */}
                        <svg
                            className="mt-8 sm:mt-10 w-full h-10 opacity-70"
                            viewBox="0 0 240 40"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                        >
                            <path
                                className="pulse-path"
                                d="M0 20 H70 L82 20 L90 4 L100 36 L108 20 H240"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </motion.div>

                    {/* Form panel */}
                    <div className="bg-card p-6 sm:p-10 lg:p-12">
                        {isSubmitted ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.35 }}
                                className="h-full flex flex-col items-center justify-center text-center py-10"
                            >
                                <span className="p-4 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 mb-4">
                                    <CheckCircle2 size={32} />
                                </span>
                                <h2 className="text-xl sm:text-2xl font-bold text-t1">
                                    Message sent
                                </h2>
                                <p className="text-t2 mt-2 max-w-sm">
                                    Thanks for reaching out. Our team will get
                                    back to you as soon as possible.
                                </p>
                                <button
                                    onClick={resetForm}
                                    className="mt-6 px-5 py-2.5 rounded-xl text-sm font-semibold text-primary border-2 border-primary hover:bg-primary hover:text-white transition-colors"
                                >
                                    Send another message
                                </button>
                            </motion.div>
                        ) : (
                            <>
                                <h2 className="text-xl sm:text-2xl font-bold text-t1">
                                    Send us a message
                                </h2>
                                <p className="text-t2 mt-1.5 text-sm">
                                    Fill out the form below — fields marked with
                                    * are required.
                                </p>

                                <form
                                    onSubmit={handleSubmit}
                                    noValidate
                                    className="mt-6 sm:mt-8 space-y-5"
                                >
                                    <div className="grid sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="text-xs font-medium text-t2 mb-1.5 block">
                                                Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={values.name}
                                                onChange={handleChange("name")}
                                                placeholder="Your full name"
                                                className={`w-full px-4 py-2.5 rounded-xl border-2 text-sm text-t1 bg-page focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors ${
                                                    errors.name
                                                        ? "border-red-400"
                                                        : "border-border focus:border-primary"
                                                }`}
                                            />
                                            {errors.name && (
                                                <p className="text-xs text-red-500 mt-1">
                                                    {errors.name}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="text-xs font-medium text-t2 mb-1.5 block">
                                                Email *
                                            </label>
                                            <input
                                                type="email"
                                                value={values.email}
                                                onChange={handleChange("email")}
                                                placeholder="you@example.com"
                                                className={`w-full px-4 py-2.5 rounded-xl border-2 text-sm text-t1 bg-page focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors ${
                                                    errors.email
                                                        ? "border-red-400"
                                                        : "border-border focus:border-primary"
                                                }`}
                                            />
                                            {errors.email && (
                                                <p className="text-xs text-red-500 mt-1">
                                                    {errors.email}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="text-xs font-medium text-t2 mb-1.5 block">
                                                Phone (optional)
                                            </label>
                                            <input
                                                type="tel"
                                                value={values.phone}
                                                onChange={handleChange("phone")}
                                                placeholder="+20 1xx xxx xxxx"
                                                className="w-full px-4 py-2.5 rounded-xl border-2 border-border text-sm text-t1 bg-page focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-xs font-medium text-t2 mb-1.5 block">
                                                Subject *
                                            </label>
                                            <input
                                                type="text"
                                                value={values.subject}
                                                onChange={handleChange(
                                                    "subject",
                                                )}
                                                placeholder="What's this about?"
                                                className={`w-full px-4 py-2.5 rounded-xl border-2 text-sm text-t1 bg-page focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors ${
                                                    errors.subject
                                                        ? "border-red-400"
                                                        : "border-border focus:border-primary"
                                                }`}
                                            />
                                            {errors.subject && (
                                                <p className="text-xs text-red-500 mt-1">
                                                    {errors.subject}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-medium text-t2 mb-1.5 block">
                                            Message *
                                        </label>
                                        <textarea
                                            value={values.message}
                                            onChange={handleChange("message")}
                                            rows={5}
                                            placeholder="Tell us how we can help..."
                                            className={`w-full px-4 py-3 rounded-xl border-2 text-sm text-t1 bg-page focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors resize-none ${
                                                errors.message
                                                    ? "border-red-400"
                                                    : "border-border focus:border-primary"
                                            }`}
                                        />
                                        {errors.message && (
                                            <p className="text-xs text-red-500 mt-1">
                                                {errors.message}
                                            </p>
                                        )}
                                    </div>

                                    {submitError && (
                                        <p className="text-sm text-red-500 bg-red-500/10 rounded-lg px-4 py-2.5">
                                            {submitError}
                                        </p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white bg-primary hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2
                                                    size={16}
                                                    className="animate-spin"
                                                />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send size={16} />
                                                Send message
                                            </>
                                        )}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GeneralContactUs;
