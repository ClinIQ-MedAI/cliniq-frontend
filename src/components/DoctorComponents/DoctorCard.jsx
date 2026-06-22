

import { Star } from "lucide-react"
import { Button } from "../Button"
import { useNavigate } from "react-router-dom"

const Stars = () => {

}
/**
 * 
 * @param {Object} props
 * @param {string} props.image 
 * @param {string} props.name 
 * @param {string} props.speciality 
 * @param {string?} props.rating 
 * @param {number} props.numberOfRatings
 * @returns 
 */
export const DoctorCard = (props) => {
    const navigate = useNavigate()
    return <div className="flex flex-col hover:-translate-y-2 transition justify-center items-center p-10 rounded-xl shadow-[0_0_10px_3px_#00000029] gap-4 h-full">

        <div className="relative before:absolute before:content('') flex justify-center w-full before:w-full before:h-[calc(100%-30px)] before:rounded-xl before:bottom-0 before:bg-(--primary-color) ">
            <img src={props.image} className="h-50 w-50 object-cover z-10 relative" alt="" />
        </div>

        <div className="flex flex-col items-center gap-2 flex-1 w-full">
            <h2 className="text-center font-bold text-xl">{props.name}</h2>
            <p className="text-(--default-color)/80 text-center">{props.speciality}</p>

            <div className="flex gap-3 mb-2">
                {[1, 2, 3, 4, 5].map(star => {
                    const rating = props?.rating || 0
                    let fillPercentage = (rating - (star - 1)) * 100
                    fillPercentage = Math.min(100, Math.max(0, fillPercentage));

                    return (
                        <div key={star} className="relative inline-block w-6 h-6">
                            <Star className="text-gray-300 w-full h-full absolute top-0 left-0" />
                            <div
                                className="absolute top-0 left-0 overflow-hidden h-full"
                                style={{ width: `${fillPercentage}%` }}
                            >
                                <Star className="text-(--primary-color) w-6 h-6 fill-current" />
                            </div>
                        </div>
                    )
                })}
                <span>({props.numberOfRatings})</span>
            </div>
        </div>

        <div className="mt-auto active:scale-95 transition">
            <Button primary={false} text={'Book an Appointment'} />
        </div>

    </div>
}