import { Check } from "lucide-react"
import { useState } from "react"
import { Button } from "../Button"
import { X } from "lucide-react"

export const SignUpForm = ({ setOpenSignUpForm }) => {
    const [checked, setChecked] = useState(false)
    return (
        <div className="fixed flex justify-center items-center top-0 left-0 w-full h-full bg-[#00000094]">

            <form className="flex   relative items-center text-(--default-color) rounded-xl overflow-hidden">
                <div className="absolute right-2 top-2 cursor-pointer" onClick={() => setOpenSignUpForm(false)}>
                    <X className="text-red-500" />
                </div>
                <div className="flex w-[1280px]">
                    {/* Left */}
                    <div className="bg-(--primary-color) text-xl hidden lg:block w-2/5 p-10 text-white">
                        <span className="font-bold">Hospital</span> logo
                        <img src="" alt="" />
                        <img src="" alt="" />
                    </div>

                    {/* Right */}
                    <div className="bg-(--white-color) p-10 w-full lg:w-3/5 pb-[60px]">
                        <h2 className="text-(--default-color) text-3xl font-semibold">Sign up For account</h2>

                        <div className="mt-5 pr-40 flex flex-col">
                            <div className="flex justify-between">
                                <div className="flex flex-col">
                                    <label htmlFor="">First Name</label>
                                    <input type="text" placeholder="Your First Name" className="placeholder:text-center focus:ring-2 outline-0 ring-blue-400  rounded-lg border border-[#DEDEDE] px-5 py-4 bg-gray-200" />
                                </div>
                                <div className="flex flex-col">
                                    <label htmlFor="">Last Name</label>
                                    <input type="text" placeholder="Your Last Name" className="placeholder:text-center focus:ring-2 outline-0 ring-blue-400  rounded-lg border border-[#DEDEDE] px-5 py-4 bg-gray-200" />
                                </div>
                            </div>
                            <div className="flex flex-col mt-4">
                                <label htmlFor="">Email Address</label>
                                <input type="text" placeholder="Enter Your email Address" className="placeholder:text-center focus:ring-2 outline-0 ring-blue-400  rounded-lg border border-[#DEDEDE] px-5 py-4 bg-gray-200" />
                            </div>
                            <div className="flex justify-between  mt-4">
                                <div className="flex flex-col">
                                    <label htmlFor="">Password</label>
                                    <input type="text" placeholder="Your Password" className="placeholder:text-center focus:ring-2 outline-0 ring-blue-400  rounded-lg border border-[#DEDEDE] px-5 py-4 bg-gray-200" />
                                </div>
                                <div className="flex flex-col">
                                    <label htmlFor="">Confirm Password</label>
                                    <input type="text" placeholder="Confirm Your Password" className="placeholder:text-center focus:ring-2 outline-0 ring-blue-400  rounded-lg border border-[#DEDEDE] px-5 py-4 bg-gray-200" />
                                </div>
                            </div>

                            <div className="mt-4">
                                <input type="checkbox" id="accept" className="hidden" onClick={() => setChecked(prev => !prev)} />
                                <label htmlFor="accept" className="flex items-center gap-2">
                                    <div className={`w-8 h-8 flex justify-center items-center border rounded-sm ${checked ? "bg-(--primary-color)" : ""}`}>
                                        {checked && <Check className="text-(--white-color)" />}
                                    </div>
                                    I accept all
                                    <span className="text-(--primary-color)"> terms and condition</span>
                                </label>
                            </div>
                            <button type={'submit'} className={`primary text-center mt-8 w-[300px] mx-auto justify-center rounded-lg border-2 border-(--primary-color) px-6 py-4 cursor-pointer gap-2 items-center flex`}>
                                Sign Up
                            </button>

                            <p className="flex justify-center mt-20">Already have an account ? <button className="text-(--primary-color) cursor-pointer hover:underline">Log in</button></p>
                        </div>
                    </div>
                </div>

            </form>
        </div>
    )
}