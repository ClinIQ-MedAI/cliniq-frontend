import { Check } from "lucide-react"
import { useState } from "react"
import { X } from "lucide-react"
import Doctor1 from '/Doctor1SignUp.png'
import Doctor2 from '/Doctor2SignUp.png'
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'
export const LoginForm = ({ setOpenLoginForm, setOpenSignUpForm }) => {
    const [checked, setChecked] = useState(false)

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setOpenLoginForm(false)}
            className="fixed flex z-100 justify-center items-center top-0 left-0 w-full h-full bg-[#00000094]">
            <motion.form
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 25 }}
                onClick={(e) => e.stopPropagation()}
                className="flex  mx-10   relative items-center text-(--default-color) rounded-xl overflow-hidden">
                <div className="absolute right-2 top-2 cursor-pointer" onClick={() => setOpenLoginForm(false)}>
                    <X className="text-red-500" />
                </div>
                <div className="flex w-7xl">
                    {/* Left */}
                    <div className="bg-(--primary-color) text-xl hidden relative lg:block w-2/5 p-10 text-white">
                        <span className="font-bold">Hospital</span> logo
                        <img src={Doctor1} className="absolute bottom-0 -left-15 h-150" alt="" />
                        <img src={Doctor2} className="absolute bottom-0 right-0 h-112.5" alt="" />
                    </div>

                    {/* Right */}
                    <div className="bg-(--white-color) p-10 w-full lg:w-3/5 pb-15">
                        <h2 className="text-(--default-color) text-3xl font-semibold">Log In Your Account</h2>

                        <div className="mt-5 lg:pr-40 flex flex-col">
                            <div className="flex flex-col mt-4">
                                <label htmlFor="">Email Address</label>
                                <input type="text" placeholder="Enter Your email Address" className="placeholder:text-center focus:ring-2 outline-0 ring-blue-400  rounded-lg border border-[#DEDEDE] px-5 py-4 bg-gray-200" />
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="">Password</label>
                                <input type="text" placeholder="Your Password" className="placeholder:text-center focus:ring-2 outline-0 ring-blue-400  rounded-lg border border-[#DEDEDE] px-5 py-4 bg-gray-200" />
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
                            <button type={'submit'} className={`primary text-center mt-8 w-75 mx-auto justify-center rounded-lg border-2 border-(--primary-color) px-6 py-4 cursor-pointer gap-2 items-center flex`}>
                                Login
                            </button>

                            <p className="flex justify-center mt-20">Don't have an account ? <button type="button" className="text-(--primary-color) cursor-pointer hover:underline" onClick={() => {
                                setOpenLoginForm(false)
                                setOpenSignUpForm(true)
                            }}>Sign Up</button></p>
                        </div>
                    </div>
                </div>

            </motion.form>
        </motion.div>
    )
}