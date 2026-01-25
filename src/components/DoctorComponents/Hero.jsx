import { ArrowRight } from "lucide-react"
import { Button } from "../Button"
import { Play } from "lucide-react"

export const Hero = () => {
    return <>
        {/* Left Details */}
        <div className="mt-4  flex flex-col gap-10">
            {/* Text */}
            <div className="w-125 flex flex-col gap-4">
                <h1 className="text-(--gray-color) text-4xl font-bold"><span className="text-(--primary-color)">We care</span><br />
                    about your health</h1>
                <p className=" text-gray-400">
                    Good health is the state of mental, physical and social well being
                    and it does not just mean absence of diseases.
                </p>
            </div>
            {/* Appointment Buttons */}
            <div className="flex gap-2">
                <Button text={'Book an appointment'} primary={true} Icon={ArrowRight} />
                <button className="flex gap-2  w-[500px] items-center cursor-pointer ">
                    <div className=" cursor-pointer h-full aspect-square rounded-full p-2 bg-(--primary-color) outline-3 border-5 outline-[#C7C7C7] border-white flex justify-center items-center">
                        <Play className=" text-(--white-color) text-lg w-5 h-5" />
                    </div> <span>Watch videos</span>
                </button>
            </div>
            {/* Link to Sign Up */}
            <p>Become member of our hospital community? <button className="text-(--primary-color) cursor-pointer hover:underline">Sign up</button></p>

            {/* Form Find Doctor */}
            <form className="p-4   shadow-[0_0_16px_8px_#00000024] text-(--default-color) bg-white md:w-fit rounded-2xl">
                <h2 className="pl-3 font-semibold">Find a doctor</h2>
                <div className="flex flex-col md:flex-row gap-6 mt-2">
                    <input type="text" className="placeholder:text-center focus:ring-2 outline-0 ring-blue-400  rounded-lg border border-[#DEDEDE] px-3 py-2 bg-gray-200" placeholder="Name of Doctor" />
                    <input type="text" className="placeholder:text-center focus:ring-2 outline-0 ring-blue-400  rounded-lg border border-[#DEDEDE] px-3 py-2 bg-gray-200" placeholder="Speciality" />
                    <div className="flex items-center gap-4">
                        <label htmlFor="">Availability</label>
                        <input type="checkbox" />
                    </div>
                    <Button className="" text={'Search'} primary={true} />
                </div>
            </form>
            {/* Image Part */}
            {/* <div></div> */}

            {/* <div className="w-100">

            </div> */}
        </div>
    </>
}