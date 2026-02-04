import { Star } from "lucide-react";

/**
 * 
 * @param {Object} props 
 * @param {String} props.imageUrl 
 * @param {String} props.name
 * @param {String} props.rating
 * @param {String} props.specialityPatient 
 * @param {String} props.feedback 
 * @returns 
 */
export const FeedbackCard = (props) => {
    return <div className="flex flex-col justify-center xl:flex-row items-start gap-4">
        <img src={props.imageUrl} className="size-20 mx-auto rounded-full xl:ml-[32.5px] shadow-[-12.2px_0_0_0_var(--primary-color)]" alt="" />
        <div className="space-y-2">
            <h2 className="text-2xl text-center xl:text-left">{props.name}</h2>
            <p className="text-[#767676] text-center xl:text-left">{props.specialityPatient}</p>
            <div className="flex gap-3 justify-center xl:justify-start mb-2">
                {[1, 2, 3, 4, 5].map(star => {
                    const rating = props.rating || 0
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
            </div>
            <p className="mb-9">{props.feedback}</p>
        </div>
    </div>
}