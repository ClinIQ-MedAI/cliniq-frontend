// src/features/auth/hooks/useOtpTimer.ts
// Countdown بسيط لزرار "إعادة الإرسال" — بيتستخدم في verify-email, verify-phone, و login OTP كلهم.

import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_SECONDS = 60;

export function useOtpTimer(initialSeconds = DEFAULT_SECONDS) {
    const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
    const intervalRef = useRef(null);

    const clear = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    const start = useCallback(
        (seconds = initialSeconds) => {
            clear();
            setSecondsLeft(seconds);
            intervalRef.current = setInterval(() => {
                setSecondsLeft((prev) => {
                    if (prev <= 1) {
                        clear();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        },
        [clear, initialSeconds],
    );

    useEffect(() => {
        start();
        return clear;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        secondsLeft,
        canResend: secondsLeft === 0,
        restart: start,
    };
}
