import logo from '/Logo.jpg'
import { Link, useLocation } from 'react-router-dom'
import { Button } from './Button'
import { Menu } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
export const Navbar = ({ setOpenSignUpForm, setOpenLoginForm }) => {
    const { pathname } = useLocation()
    const [openMenu, setOpenMenu] = useState(false)

    console.log(pathname)
    return <header className='header'>
        <div className='container flex justify-between px-(--padding-inline)'>
            <img src={logo} className='logo' alt="" />
            <div style={{ display: "flex", gap: "50px", alignItems: "center" }}>

                <div className='md:hidden relative z-30'>
                    <Menu className='cursor-pointer active:scale-85 transition border-2 border-(--primary-color) p-2 rounded-lg size-10' onClick={() => setOpenMenu(!openMenu)} />
                    <AnimatePresence>
                        {openMenu && <motion.nav
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                            className='header-nav flex flex-col p-4  bg-gray-200 rounded-xl right-0 top-full absolute w-50'>
                            <Link className={`${pathname === "/" ? "active" : ""} header-link`} to={"/"}>Home</Link>
                            <Link className={`${pathname === "/service" ? "active" : ""} header-link`} to={"/service"}>Service</Link>
                            <Link className={`${pathname === "/doctors" ? "active" : ""} header-link`} to={"/doctors"}>Doctors</Link>
                            <Link className={`${pathname === "/about" ? "active" : ""} header-link`} to={"/about"}>About us</Link>
                            <Link className={`${pathname === "/contact" ? "active" : ""} header-link`} to={"/contact"}>Contact us</Link>
                            <Button text={"Sign in"} classNames={''} primary={true} onClick={() => setOpenLoginForm(prev => !prev)} />
                            <Button text={"Sign up"} classNames={'justify-center'} primary={false} onClick={() => setOpenSignUpForm(prev => !prev)} />
                        </motion.nav>}
                    </AnimatePresence>

                </div>
                <nav className='header-nav hidden md:flex'>
                    <Link className={`${pathname === "/" ? "active" : ""} header-link`} to={"/"}>Home</Link>
                    <Link className={`${pathname === "/service" ? "active" : ""} header-link`} to={"/service"}>Service</Link>
                    <Link className={`${pathname === "/doctors" ? "active" : ""} header-link`} to={"/doctors"}>Doctors</Link>
                    <Link className={`${pathname === "/about" ? "active" : ""} header-link`} to={"/about"}>About us</Link>
                    <Link className={`${pathname === "/contact" ? "active" : ""} header-link`} to={"/contact"}>Contact us</Link>
                </nav>

                <div style={{ gap: "10px" }} className='hidden md:flex'>
                    <Button text={"Sign in"} primary={true} onClick={() => setOpenLoginForm(prev => !prev)} />
                    <Button text={"Sign up"} primary={false} onClick={() => setOpenSignUpForm(prev => !prev)} />
                </div>

            </div>
        </div>
    </header>
}