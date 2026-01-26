import logo from '/Logo.jpg'
import { Link, useLocation } from 'react-router-dom'
import { Button } from './Button'

export const Navbar = ({ setOpenSignUpForm }) => {
    const { pathname } = useLocation()
    console.log(pathname)
    return <header className='header'>
        <div className='container flex justify-between px-(--padding-inline)'>
            <img src={logo} className='logo' alt="" />
            <div style={{ display: "flex", gap: "50px", alignItems: "center" }}>
                <nav className='header-nav'>
                    <Link className={`${pathname === "/" ? "active" : ""} header-link`} to={"/"}>Home</Link>
                    <Link className={`${pathname === "/service" ? "active" : ""} header-link`} to={"/service"}>Service</Link>
                    <Link className={`${pathname === "/doctors" ? "active" : ""} header-link`} to={"/doctors"}>Doctors</Link>
                    <Link className={`${pathname === "/about" ? "active" : ""} header-link`} to={"/about"}>About us</Link>
                    <Link className={`${pathname === "/contact" ? "active" : ""} header-link`} to={"/contact"}>Contact us</Link>
                </nav>

                <div style={{ display: "flex", gap: "10px" }}>
                    <Button text={"Sign in"} primary={true} onClick={() => setOpenSignUpForm(prev => !prev)} />
                    <Button text={"Sign up"} primary={false} onClick={() => setOpenSignUpForm(prev => !prev)} />
                </div>
            </div>
        </div>
    </header>
}