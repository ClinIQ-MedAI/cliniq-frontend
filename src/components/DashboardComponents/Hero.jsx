import { ArrowRight } from "lucide-react"
import { Button } from "../Button"
import { Play } from "lucide-react"
import Banner from '/Banner.png'
import { FloatingComponent } from "../FloatingComponent"
import { SearchIcon } from "lucide-react"
import { ClipboardListIcon } from "lucide-react"
import { Phone } from "lucide-react"
import { useState } from "react"
export const Hero = () => {
    const [available, setAvailable] = useState(false)
    return <>
        {/* Left Details */}
        <div className="mt-4 relative  flex flex-col gap-10">
            {/* Text */}
            <div className="w-125 flex flex-col gap-4 relative z-20">
                <h1 className="text-(--gray-color) text-4xl font-bold text-center md:text-left"><span className="text-(--primary-color)">We care</span><br />
                    about your health</h1>
                <p className=" text-gray-400 text-center md:text-left">
                    Good health is the state of mental, physical and social well being
                    and it does not just mean absence of diseases.
                </p>
            </div>
            {/* Appointment Buttons */}
            <div className="flex gap-2 w-100 lg:w-125">
                <Button text={'Book an appointment'} classNames={'flex-1 '} primary={true} Icon={ArrowRight} />
                <button className="flex gap-2 flex-1  items-center cursor-pointer ">
                    <div className=" cursor-pointer h-full aspect-square rounded-full p-2 bg-(--primary-color) outline-3 border-5 outline-[#C7C7C7] border-white flex justify-center items-center">
                        <Play className=" text-(--white-color) text-lg w-5 h-5" />
                    </div> <span>Watch videos</span>
                </button>
            </div>
            {/* Link to Sign Up */}
            <p>Become member of our hospital community? <button className="text-(--primary-color) cursor-pointer hover:underline">Sign up</button></p>

            {/* Form Find Doctor */}
            <form className="p-4 relative z-20  shadow-[0_0_16px_8px_#00000024] text-(--default-color) bg-white lg:w-fit rounded-2xl">
                <h2 className="pl-3 font-semibold">Find a doctor</h2>
                <div className="flex flex-col lg:flex-row gap-6 mt-2">
                    <input type="text" className="placeholder:text-center focus:ring-2 outline-0 ring-blue-400  rounded-lg border border-[#DEDEDE] px-3 py-2 bg-gray-200" placeholder="Name of Doctor" />
                    <input type="text" className="placeholder:text-center focus:ring-2 outline-0 ring-blue-400  rounded-lg border border-[#DEDEDE] px-3 py-2 bg-gray-200" placeholder="Speciality" />
                    <div className="flex items-center gap-4">
                        <label htmlFor="availability" className="flex items-center  gap-2 cursor-pointer">Availability
                            <div className="w-13 h-6  border rounded-full relative overflow-hidden">
                                <div className={`absolute transition-all bg-(--primary-color) left-0 top-0 h-full ${available ? "w-full" : "w-0"} `}>

                                </div>
                                <div className={`h-[calc(100%-2px)] absolute transition aspect-square rounded-full border bg-(--white-color) left-0 top-1/2 -translate-y-1/2 ${available ? "translate-x-7.5 " : ""}`}></div>
                            </div>
                        </label>
                        <input type="checkbox" id="availability" className="hidden" value={available} onChange={(e) => setAvailable(e.target.checked)} />

                    </div>
                    <Button className="" text={'Search'} primary={true} />
                </div>
            </form>
            {/* Image Part */}
            <div className="absolute lg:w-100 xl:w-110 aspect-square bottom-0 right-10 hidden lg:block">

                {/* Circle Background Layers */}
                <div className="absolute inset-0 rounded-full border-20 border-white outline-20 outline-[#E7E7E7] overflow-hidden z-10">

                    <div className="absolute inset-0 bg-(--primary-color)"></div>

                    <img src={Banner} style={{ clipPath: "inset(50% 0 0 0)" }} className="h-150 absolute -bottom-7 -right-5 object-cover " alt="" />

                    <div className="absolute w-full h-full bg-linear-to-t from-(--primary-color) via-transparent to-transparent z-20"></div>
                </div>
                <div className="absolute inset-0 z-20 pointer-events-none">
                    <img
                        src={Banner}
                        className="h-150 absolute -bottom-3 -right-5 object-cover"
                        alt="Doctors"
                        style={{ clipPath: "inset(0 0 50% 0)" }}
                    />
                </div>
                <div className="hidden xl:block">
                    <FloatingComponent
                        title="Well Qualified doctors"
                        text="Treat with care"
                        Icon={SearchIcon}
                        paragraphStyleClasses="text-gray-500 text-sm"
                        classNames="bg-white absolute top-6 -left-24 shadow-xl px-5 py-4 rounded-2xl z-10 flex items-center gap-3"
                    />


                    <FloatingComponent
                        title="Book an appointment"
                        text="Online appointment"
                        Icon={ClipboardListIcon}
                        paragraphStyleClasses="text-gray-500 text-sm"

                        classNames="bg-white absolute bottom-50 -left-24 shadow-xl px-5 py-4 rounded-2xl z-30 flex items-center gap-3"
                    />

                    <FloatingComponent
                        title="Contact no"
                        text="+9715123871325"
                        Icon={Phone}
                        paragraphStyleClasses="text-gray-800 font-medium text-sm"
                        classNames="bg-white/60 backdrop-blur-md border border-white/50 absolute top-1/2 -right-20 shadow-xl px-5 py-4 rounded-2xl z-30 flex flex-row-reverse items-center gap-3 translate-y-[-50%]"
                    />
                </div>

            </div>

            {/* <div className="w-100">

            </div> */}
        </div>
    </>
}