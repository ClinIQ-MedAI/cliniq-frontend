
import { X } from "lucide-react"
import Doctor1 from '/Doctor1SignUp.png'
import Doctor2 from '/Doctor2SignUp.png'
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'
import { useForm } from "react-hook-form"
import api from "../apis/api"
import API_ENDPOINTS from "../apis/endpoints"
import toast from "react-hot-toast"
import { Loader2 } from "lucide-react"
import { useContext } from "react"
import UserContext from "../contexts/UserContext"
import { useNavigate } from "react-router-dom"
export const LoginForm = ({ setOpenLoginForm, setOpenSignUpForm }) => {
    const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm()
    const {user,setUser} = useContext(UserContext)
    const navigate = useNavigate()
    async function handleLoginSubmit(data) {
        data


        // send to api
        try {

            //  simulation
            await new Promise((resolve) => setTimeout(() => resolve(), 1500))

            // const errorToThrow = {
            //     response: {
            //         status: 400,
            //         data: { message: "Password is incorrect" }
            //     }
            // };
            // throw errorToThrow;


            // real api
            // const response = await api.post(API_ENDPOINTS.signup, combinedData, {
            //     headers: { "Content-Type": 'application/json' }
            // })
            setUser(prev=>({
               ...prev, 
                email:data.email,
                role: data.role || "DOCTOR"
            }))

            if(true){
                navigate('/doctor-dashboard')
            }
            toast.success('user logged in successfully')
            setOpenLoginForm(false)
            // TODO: store token in localstorage or something else

        } catch (error) {
            console.log(error.response.data.message)
            if (error.response) {
                const status = error.response.status;
                const serverMessage = error.response.data?.message || "An error occurred";
                const msgLower = serverMessage.toLowerCase();
                if (status === 400) {
                    if (msgLower.includes('email')) {
                        setError('email', { type: 'server', message: serverMessage });
                    } else if (msgLower.includes('password')) {
                        setError('password', { type: 'server', message: serverMessage });
                    } else {
                        setError('root', { type: 'server', message: serverMessage });
                    }
                } else if (status === 404) {
                    setError('email', { type: 'server', message: serverMessage });
                }
                else if (status === 500) {
                    setError('root', { type: 'server', message: "Server error. Please try again later." });
                } else {
                    setError("root", { type: "server", message: serverMessage });
                }
            }
            else if (error.request) {
                setError("root", {
                    type: "server",
                    message: "Network Error. Please check your internet connection."
                });
            } else {
                setError("root", {
                    type: "server",
                    message: "Application Error: " + error.message
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
            onClick={() => setOpenLoginForm(false)}
            className="fixed flex z-100 justify-center items-center top-0 left-0 w-full h-full bg-[#00000094]">
            <motion.form
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 25 }}
                onClick={(e) => e.stopPropagation()}
                onSubmit={handleSubmit(handleLoginSubmit)}
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
                                <input type="text" {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: "Invalid Email" } })} placeholder="Enter Your email Address" className="placeholder:text-center focus:ring-2 outline-0 ring-blue-400  rounded-lg border border-[#DEDEDE] px-5 py-4 bg-gray-200" />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}

                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="">Password</label>
                                <input type="password" placeholder="Your Password" {...register('password', { required: 'Password is required' })} className="placeholder:text-center focus:ring-2 outline-0 ring-blue-400  rounded-lg border border-[#DEDEDE] px-5 py-4 bg-gray-200" />
                                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                            </div>


                            <button type={'submit'} disabled={isSubmitting} className={`primary text-center md:mt-8 w-75 mx-auto justify-center rounded-lg border-2 border-(--primary-color) px-6 py-4 cursor-pointer gap-2 items-center flex disabled:bg-gray-500!`}>
                                Login
                                {isSubmitting && <Loader2 className="animate-spin" />}
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