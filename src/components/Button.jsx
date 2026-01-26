export const Button = ({ text, type, primary, onClick, Icon }) => {
    return <button type={type || 'button'} className={`${primary ? "primary" : "secondary"} hover:scale-105 transition active:scale-95 rounded-lg border-2 border-(--primary-color) button gap-2 items-center flex`} onClick={onClick}>
        {text}{Icon && <Icon />}
    </button>
}