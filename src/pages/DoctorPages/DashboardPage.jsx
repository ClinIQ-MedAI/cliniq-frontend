import { General } from "../../components/DoctorComponents/General"
import { Hero } from "../../components/DoctorComponents/Hero"
import { Service } from "../../components/DoctorComponents/Service"
import Microscope from '/Microscope.svg'
import ChatCenter from '/ChatCenter.svg'
import Ambulance from '/Ambulance.svg'
import Chat from '/Chat.svg'
import { SignUpForm } from "../../components/DoctorComponents/SignupForm"

export const DashboardPage = ({ openSignUpForm, setOpenSignUpForm }) => {

    return <main className="container  px-(--padding-inline)">
        {openSignUpForm && <SignUpForm setOpenSignUpForm={setOpenSignUpForm} />}
        <Hero />
        <General head={"Our Medical Services"} paragraph={"We are dedicated to serve you best medical services"}>
            <div className=" flex flex-col md:flex-row justify-stretch gap-10 ">
                <Service text={"Well equipped lab"} Icon={Microscope} />
                <Service text={"Well equipped lab"} Icon={Ambulance} isBlue={true} />
                <Service text={"Well equipped lab"} Icon={Chat} />
                <Service text={"Well equipped lab"} Icon={ChatCenter} />
            </div>

        </General>
    </main >
} 