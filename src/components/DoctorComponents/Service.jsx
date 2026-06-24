export const Service = ({ Icon, text, isBlue }) => {
    return (
        <div className={`flex flex-col w-full md:w-1/4 gap-10 p-8 shadow-[0_0_10px_5px_#0000002c] rounded-2xl ${isBlue ? "bg-(--primary-color)" : "bg-(--white-color)"}`}>
            <div className={` justify-center flex ${isBlue ? "text-(--white-color)" : "text-(--primary-color)"}`}>
                {Icon && <img src={Icon || ""} className="w-14 h-14" />}
            </div>
            <p className={`text-center ${isBlue ? "text-(--white-color)" : "text-(--primary-color)"}`}>{text}</p>

        </div>
    )
}