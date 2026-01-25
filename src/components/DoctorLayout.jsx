import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export const DoctorLayout = ({ setOpenSignUpForm }) => {

    return <>
        <Navbar setOpenSignUpForm={setOpenSignUpForm} />
        <Outlet />
        <Footer />
    </>
}