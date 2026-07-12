import { General } from "../components/DashboardComponents/General";
import { Hero } from "../components/DashboardComponents/Hero";
import { Service } from "../components/DoctorComponents/Service";
import Microscope from "/Microscope.svg";
import ChatCenter from "/ChatCenter.svg";
import Ambulance from "/Ambulance.svg";
import Chat from "/Chat.svg";
import { SignUpForm } from "../components/SignUpForm";
import { DoctorCard } from "../components/DoctorComponents/DoctorCard";
import Doctor1 from "/Doctor1.png";
import Doctor2 from "/Doctor2.png";
import Doctor3 from "/doctor3.png";
import Doctor4 from "/Doctor4.png";
import { Button } from "../components/Button";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { LoginForm } from "../components/LoginForm";
import { FeedbackCard } from "../components/Feedback";
import patient1 from "/patient1.jpg";
import patient2 from "/patient2.png";
import patient3 from "/patient3.png";
import { ChevronLeft } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useEffect } from "react";
const DoctorArray = [
    {
        imageUrl: Doctor1,
        name: "Dr. Robert Henry",
        specialty: "Cardiologist",
        avgRating: 4,
        numberOfRatings: 95,
    },
    {
        imageUrl: Doctor2,
        name: "Dr. Harry Littleton",
        specialty: "Neurologist",
        numberOfRatings: 102,
        avgRating: 5,
    },
    {
        imageUrl: Doctor3,
        name: "Dr. Sharina Khan",
        specialty: "Gynologist",
        numberOfRatings: 90,
        avgRating: 3.5,
    },
    {
        imageUrl: Doctor4,
        name: "Dr. Sanjeev Kapoor",
        specialty: "Child Specialist",
        numberOfRatings: 80,
        avgRating: 4.5,
    },
];

const Feedbacks = [
    {
        imageUrl: patient2,
        rating: 4,
        name: "Sara Ali Khan",
        specialityPatient: "Cardiologist Patient",
        feedback:
            "Thanks for all the services, no doubt it is the best hospital.",
    },
    {
        imageUrl: patient1,
        rating: 4.5,
        name: "Simon Targett",
        specialityPatient: "Neurologist Patient",
        feedback:
            "Thanks for all the services, no doubt it is the best hospital.",
    },
    {
        imageUrl: patient3,
        rating: 5,
        name: "Sara Ali Khan",
        specialityPatient: "Cardiologist Patient",
        feedback:
            "Thanks for all the services, no doubt it is the best hospital.",
    },
    {
        imageUrl: patient1,
        rating: 5,
        name: "there we go",
        specialityPatient: "we",
        feedback:
            "Thanks for all the services, no doubt it is the best hospital.",
    },
    {
        imageUrl: patient1,
        rating: 5,
        name: "there we go",
        specialityPatient: "we",
        feedback:
            "Thanks for all the services, no doubt it is the best hospital.",
    },
    {
        imageUrl: patient1,
        rating: 5,
        name: "there we go",
        specialityPatient: "we",
        feedback:
            "Thanks for all the services, no doubt it is the best hospital.",
    },
];

export const DashboardPage = ({
    openSignUpForm,
    setOpenSignUpForm,
    openLoginForm,
    setOpenLoginForm,
}) => {
    const navigate = useNavigate();
    // 1. Add this logic inside your component function
    const [index, setIndex] = useState(0);
    const [itemsToShow, setItemsToShow] = useState(1);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setItemsToShow(3);
            } else if (window.innerWidth >= 768) {
                setItemsToShow(2);
            } else {
                setItemsToShow(1);
            }
        };

        handleResize();

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);
    const handleNext = () => {
        // Cycles to the start if at the end
        setIndex((prev) =>
            prev >= Feedbacks.length - itemsToShow ? 0 : prev + 1,
        );
    };

    const handlePrev = () => {
        // Cycles to the end if at the start
        setIndex((prev) =>
            prev === 0 ? Feedbacks.length - itemsToShow : prev - 1,
        );
    };
    return (
        <main className="container  px-(--padding-inline)">
            <AnimatePresence mode="wait">
                {openSignUpForm && (
                    <SignUpForm
                        key="signup-modal"
                        setOpenLoginForm={setOpenLoginForm}
                        setOpenSignUpForm={setOpenSignUpForm}
                    />
                )}
                {openLoginForm && (
                    <LoginForm
                        key="login-modal"
                        setOpenSignUpForm={setOpenSignUpForm}
                        setOpenLoginForm={setOpenLoginForm}
                    />
                )}
            </AnimatePresence>
            <Hero />
            <General
                head={"Our Medical Services"}
                paragraph={
                    "We are dedicated to serve you best medical services"
                }
            >
                <div className=" flex flex-col md:flex-row justify-stretch gap-10 ">
                    <Service text={"Well equipped lab"} Icon={Microscope} />
                    <Service
                        text={"Emergency Ambulance"}
                        Icon={Ambulance}
                        isBlue={true}
                    />
                    <Service text={"Online Appointment"} Icon={Chat} />
                    <Service text={"Call Center"} Icon={ChatCenter} />
                </div>
            </General>
            <General
                head={"Meet our Doctors"}
                paragraph={"Well  qualified doctors are ready to serve you"}
            >
                <div className="">
                    <div className="grid md:grid-cols-2 gap-6 md:gap-10 xl:gap-20 justify-center max-w-4xl mx-auto">
                        {" "}
                        {DoctorArray.map((doc) => (
                            <DoctorCard
                                key={doc.name}
                                numberOfRatings={doc.numberOfRatings}
                                image={doc.imageUrl}
                                rating={doc.avgRating}
                                name={doc.name}
                                speciality={doc.specialty}
                            />
                        ))}
                    </div>
                    <div className="mx-auto w-fit mt-10">
                        <Button
                            text={"See More"}
                            primary={true}
                            onClick={() => navigate("/doctors")}
                        />
                    </div>
                </div>
            </General>
            <General
                head={"Patients Testimonial"}
                paragraph={"Let’s see what our happy patients says"}
            >
                {/* Left Button */}
                <motion.button
                    onClick={handlePrev}
                    initial={{ translateY: 0, scale: 1 }}
                    whileHover={{ translateY: "-5px", scale: 1.1 }}
                    className="size-8 sm:size-10 flex justify-center z-10 items-center bg-(--primary-color) text-white rounded-full shadow-lg cursor-pointer absolute -left-2 sm:-left-5 top-1/2 -translate-y-1/2"
                >
                    <ChevronLeft />
                </motion.button>

                <div className="overflow-hidden relative w-full">
                    <motion.div
                        className="flex relative"
                        animate={{ x: `-${index * (100 / itemsToShow)}%` }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                        }}
                    >
                        {Feedbacks.map((fe, index) => (
                            <div
                                key={fe.name + "-" + index}
                                className="min-w-full md:min-w-[50%] lg:min-w-[33.333%] px-3 py-4"
                            >
                                <div className="h-full shadow-[0_0_10px_5px_#00000022] px-8 py-6 rounded-xl border border-blue-200">
                                    <FeedbackCard
                                        feedback={fe.feedback}
                                        name={fe.name}
                                        imageUrl={fe.imageUrl}
                                        rating={fe.rating}
                                        specialityPatient={fe.specialityPatient}
                                    />
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>
                {/* Right Button */}
                <motion.button
                    onClick={handleNext}
                    initial={{ translateY: 0, scale: 1 }}
                    whileHover={{ translateY: "-5px", scale: 1.1 }}
                    className="size-8 sm:size-10 flex justify-center z-10 items-center bg-(--primary-color) text-white rounded-full shadow-lg cursor-pointer absolute -right-2 sm:-right-5 top-1/2 -translate-y-1/2"
                >
                    <ChevronRight />
                </motion.button>
            </General>
        </main>
    );
};
