import { General } from "../components/DashboardComponents/General"
import { Hero } from "../components/DashboardComponents/Hero"
import { Service } from "../components/DoctorComponents/Service"
import Microscope from '/Microscope.svg'
import ChatCenter from '/ChatCenter.svg'
import Ambulance from '/Ambulance.svg'
import Chat from '/Chat.svg'
import { SignUpForm } from "../components/DoctorComponents/SignupForm"
import { DoctorCard } from "../components/DoctorComponents/DoctorCard"
import Doctor1 from '/Doctor1.png'
import Doctor2 from '/Doctor2.png'
import Doctor3 from '/Doctor3.png'
import Doctor4 from '/Doctor4.png'
import { Button } from "../components/Button"
import { useNavigate } from "react-router-dom"
import { AnimatePresence } from "framer-motion"
const DoctorArray = [
    {
        imageUrl: Doctor1,
        name: 'Dr. Robert Henry',
        specialty: "Cardiologist",
        avgRating: 4,
        numberOfRatings: 95,
    },
    {
        imageUrl: Doctor2,
        name: 'Dr. Harry Littleton',
        specialty: "Neurologist",
        numberOfRatings: 102,
        avgRating: 5
    },
    {
        imageUrl: Doctor3,
        name: 'Dr. Sharina Khan',
        specialty: "Gynologist",
        numberOfRatings: 90,
        avgRating: 3.5
    },
    {
        imageUrl: Doctor4,
        name: 'Dr. Sanjeev Kapoor',
        specialty: "Child Specialist",
        numberOfRatings: 80,
        avgRating: 4.5
    },
]

export const DashboardPage = ({ openSignUpForm, setOpenSignUpForm }) => {
    const navigate = useNavigate()

    return <main className="container  px-(--padding-inline)">
        <AnimatePresence >
            {openSignUpForm && <SignUpForm setOpenSignUpForm={setOpenSignUpForm} key="signup-modal" />}
        </AnimatePresence>
        <Hero />
        <General head={"Our Medical Services"} paragraph={"We are dedicated to serve you best medical services"}>
            <div className=" flex flex-col md:flex-row justify-stretch gap-10 ">
                <Service text={"Well equipped lab"} Icon={Microscope} />
                <Service text={"Emergency Ambulance"} Icon={Ambulance} isBlue={true} />
                <Service text={"Online Appointment"} Icon={Chat} />
                <Service text={"Call Center"} Icon={ChatCenter} />
            </div>

        </General>
        <General head={"Meet our Doctors"} paragraph={"Well  qualified doctors are ready to serve you"}>
            <div className="">

                <div className=" grid md:grid-cols-2 xl:grid-cols-[400px_400px] gap-20 justify-center">
                    {DoctorArray.map(doc => <DoctorCard key={doc.name} numberOfRatings={doc.numberOfRatings} image={doc.imageUrl} rating={doc.avgRating} name={doc.name} speciality={doc.specialty} />)}
                </div>
                <div className="mx-auto w-fit mt-10">
                    <Button text={'See More'} primary={true} onClick={() => navigate('/doctors')} />
                </div>
            </div>
        </General>
    </main >
} 