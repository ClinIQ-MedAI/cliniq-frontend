import { Check } from "lucide-react";
import { useState } from "react";
import { X } from "lucide-react";
import Doctor1 from "/Doctor1SignUp.png";
import Doctor2 from "/Doctor2SignUp.png";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import api from "../apis/api";
import API_ENDPOINTS from "../apis/endpoints";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
export const SignUpForm = ({ setOpenSignUpForm, setOpenLoginForm }) => {
    const [checked, setChecked] = useState(false);
    const navigate = useNavigate();
    const {
        register,
        watch,
        setError,
        handleSubmit,
        formState: { isSubmitting, errors },
    } = useForm();

    const password = watch("password");

    async function handleSignUpSubmit(data) {
        try {
            const response = await api.post(API_ENDPOINTS.Auth.signup, data);

            console.log(response);

            toast.success("user has been created successfully");
            setOpenSignUpForm(false);
            navigate("/verify-email", { state: { email: data.email } });
        } catch (error) {
            if (error.response) {
                const status = error.response.status;
                const serverMessage =
                    error.response.data?.message || "An error occurred";
                if (status === 409) {
                    setError("email", {
                        type: "server",
                        message: serverMessage,
                    });
                } else if (status === 400) {
                    setError("root", {
                        type: "server",
                        message: serverMessage,
                    });
                } else if (status === 500) {
                    setError("root", {
                        type: "server",
                        message: "Server error. Please try again later.",
                    });
                } else {
                    setError("root", {
                        type: "server",
                        message: serverMessage,
                    });
                }
            } else if (error.request) {
                setError("root", {
                    type: "server",
                    message:
                        "Network Error. Please check your internet connection.",
                });
            } else {
                setError("root", {
                    type: "server",
                    message: "Application Error: " + error.message,
                });
            }
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setOpenSignUpForm(false)}
            className="fixed flex z-100 justify-center items-center top-0 left-0 w-full h-full bg-[#00000094] overflow-y-auto py-6 px-4"
        >
            <motion.form
                onSubmit={handleSubmit(handleSignUpSubmit)}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{
                    duration: 0.2,
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                }}
                onClick={(e) => e.stopPropagation()}
                className="flex w-full max-w-7xl relative items-center text-(--default-color) rounded-xl overflow-hidden max-h-[90vh] overflow-y-auto my-auto"
            >
                <div
                    className="absolute right-2 top-2 cursor-pointer z-10"
                    onClick={() => setOpenSignUpForm(false)}
                >
                    <X className="text-red-500" />
                </div>
                <div className="flex flex-col lg:flex-row w-full">
                    {/* Left */}
                    <div className="bg-(--primary-color) text-xl hidden relative lg:block w-2/5 p-6 sm:p-10 text-white">
                        <span className="font-bold">Hospital</span> logo
                        <img
                            src={Doctor1}
                            className="absolute bottom-0 -left-15"
                            alt=""
                        />
                        <img
                            src={Doctor2}
                            className="absolute bottom-0 right-0"
                            alt=""
                        />
                    </div>

                    {/* Right */}
                    <div className="bg-(--white-color) p-6 sm:p-10 w-full lg:w-3/5 sm:pb-15">
                        <h2 className="text-(--default-color) text-2xl sm:text-3xl font-semibold">
                            Sign up For account
                        </h2>

                        <div className="mt-5 lg:pr-40 flex flex-col">
                            <div className="flex justify-between gap-2 flex-col sm:flex-row">
                                <div className="flex flex-1 flex-col">
                                    <label htmlFor="">First Name</label>
                                    <input
                                        {...register("firstName", {
                                            required: "FirstName is required",
                                        })}
                                        type="text"
                                        name="firstName"
                                        placeholder="Your First Name"
                                        className="placeholder:text-center focus:ring-2 outline-0 ring-blue-400  rounded-lg border border-[#DEDEDE] px-5 py-4 bg-gray-200"
                                    />
                                    {errors.fname && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.fname.message}
                                        </p>
                                    )}
                                </div>
                                <div className="flex flex-1 flex-col">
                                    <label htmlFor="">Last Name</label>
                                    <input
                                        {...register("lastName", {
                                            required: "LastName is required",
                                        })}
                                        type="text"
                                        name="lastName"
                                        placeholder="Your Last Name"
                                        className="placeholder:text-center focus:ring-2 outline-0 ring-blue-400  rounded-lg border border-[#DEDEDE] px-5 py-4 bg-gray-200"
                                    />
                                    {errors.lname && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.lname.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-1  flex-col  ">
                                <label htmlFor="">Email Address</label>
                                <input
                                    {...register("email", {
                                        required: "Email is required",
                                        pattern: {
                                            value: /^\S+@\S+$/i,
                                            message: "Invalid email address",
                                        },
                                    })}
                                    type="text"
                                    name="email"
                                    placeholder="Enter Your email Address"
                                    className="placeholder:text-center focus:ring-2 outline-0 ring-blue-400  rounded-lg border border-[#DEDEDE] px-5 py-4 bg-gray-200"
                                />

                                {errors.email && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>
                            <div className="flex justify-between gap-2 flex-col sm:flex-row">
                                <div className="flex flex-1 flex-col">
                                    <label htmlFor="">Password</label>
                                    <input
                                        {...register("password", {
                                            required: "Password is required",
                                            minLength: {
                                                value: 8,
                                                message:
                                                    "Password must be at least 8 character",
                                            },
                                        })}
                                        type="password"
                                        name="password"
                                        placeholder="Your Password"
                                        className="placeholder:text-center focus:ring-2 outline-0 ring-blue-400  rounded-lg border border-[#DEDEDE] px-5 py-4 bg-gray-200"
                                    />
                                    {errors.password && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.password.message}
                                        </p>
                                    )}
                                </div>
                                <div className="flex flex-1  flex-col">
                                    <label htmlFor="">Confirm Password</label>
                                    <input
                                        {...register("confirmPassword", {
                                            required:
                                                "Please Confirm Your Password",
                                            validate: (value) => {
                                                return (
                                                    value === password ||
                                                    "Passwords do not match"
                                                );
                                            },
                                        })}
                                        type="password"
                                        name="confirmPassword"
                                        placeholder="Confirm Your Password"
                                        className="placeholder:text-center focus:ring-2 outline-0 ring-blue-400  rounded-lg border border-[#DEDEDE] px-5 py-4 bg-gray-200"
                                    />
                                    {errors.confirmPassword && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.confirmPassword.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4">
                                <input
                                    type="checkbox"
                                    id="accept"
                                    className="hidden"
                                    {...register("checked", {
                                        required: "you should accept it",
                                    })}
                                    onClick={() => setChecked((prev) => !prev)}
                                />
                                <label
                                    htmlFor="accept"
                                    className="flex items-center gap-2"
                                >
                                    <div
                                        className={`w-8 h-8 shrink-0 flex justify-center items-center border rounded-sm ${checked ? "bg-(--primary-color)" : ""}`}
                                    >
                                        {checked && (
                                            <Check className="text-(--white-color)" />
                                        )}
                                    </div>
                                    <span className="flex flex-wrap items-center gap-1">
                                        I accept all
                                        <span className="text-(--primary-color)">
                                            terms and condition
                                        </span>
                                    </span>
                                </label>
                                {errors.checked && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.checked.message}
                                    </p>
                                )}
                            </div>
                            <button
                                type={"submit"}
                                disabled={isSubmitting}
                                className={`primary text-center md:mt-8 mt-6 w-full max-w-75 mx-auto justify-center rounded-lg border-2 border-(--primary-color) px-6 py-4 cursor-pointer gap-2 items-center flex disabled:bg-gray-500!`}
                            >
                                Sign Up
                                {isSubmitting && (
                                    <Loader2 className="animate-spin" />
                                )}
                            </button>

                            <p className="flex flex-wrap justify-center gap-1 md:mt-20 mt-8">
                                Already have an account ?{" "}
                                <button
                                    type="button"
                                    className="text-(--primary-color) cursor-pointer hover:underline"
                                    onClick={() => {
                                        setOpenSignUpForm(false);
                                        setOpenLoginForm(true);
                                    }}
                                >
                                    Log in
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </motion.form>
        </motion.div>
    );
};
