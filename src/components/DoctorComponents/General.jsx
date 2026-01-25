export const General = ({ head, paragraph, children }) => {
    return (
        <div className="text-(--default-color) mt-10">
            <h2 className="text-center text-3xl">{head}</h2>
            <p className="max-w-[290px] text-md text-gray-400 text-center mx-auto mt-2">{paragraph}</p>
            <div className="mt-10">
                {children}
            </div>
        </div>
    )
}