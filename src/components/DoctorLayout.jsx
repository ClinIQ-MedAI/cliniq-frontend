import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import Footer from "./Footer.jsx";

export const DoctorLayout = ({ setOpenSignUpForm, setOpenLoginForm }) => {

    return <>
        <Navbar setOpenSignUpForm={setOpenSignUpForm} setOpenLoginForm={setOpenLoginForm} />
        <Outlet />
        <Footer />
    </>
}