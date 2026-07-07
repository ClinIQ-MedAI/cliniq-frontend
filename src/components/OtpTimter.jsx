import {
    useRef,
    useState,
    KeyboardEvent,
    ClipboardEvent,
    ChangeEvent,
} from "react";

export function OtpInput({ length = 6, onComplete, disabled, error }) {
    const [values, setValues] = useState(Array(length).fill(""));
    const inputsRef = useRef([]);

    const focusInput = (index) => {
        inputsRef.current[index]?.focus();
    };

    const handleChange = (index, e) => {
        const digit = e.target.value.replace(/\D/g, "").slice(-1);
        const next = [...values];
        next[index] = digit;
        setValues(next);

        if (digit && index < length - 1) {
            focusInput(index + 1);
        }

        if (next.every((v) => v !== "")) {
            onComplete(next.join(""));
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !values[index] && index > 0) {
            focusInput(index - 1);
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, length);
        if (!pasted) return;

        const next = Array(length).fill("");
        pasted.split("").forEach((char, i) => {
            next[i] = char;
        });
        setValues(next);
        focusInput(Math.min(pasted.length, length - 1));

        if (pasted.length === length) {
            onComplete(pasted);
        }
    };

    return (
        <div className="flex gap-2 justify-center" dir="ltr">
            {values.map((value, index) => (
                <input
                    key={index}
                    ref={(el) => (inputsRef.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={value}
                    disabled={disabled}
                    onChange={(e) => handleChange(index, e)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className={`w-12 h-14 text-center text-lg font-medium rounded-md border bg-background text-foreground
            focus:outline-none focus:ring-2 focus:ring-primary transition-colors
            ${error ? "border-destructive" : "border-input"}
            disabled:opacity-50`}
                />
            ))}
        </div>
    );
}
