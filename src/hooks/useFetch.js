import { useEffect } from "react";
import { useState } from "react";
import api from "../apis/api";

export const useFetch = (url, method) => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function FetchData() {
            try {
                setIsLoading(true);
                const request = await api(url, { method });
                setData(request.data);
                setError(null);
            } catch (error) {
                setData(null);
                setError(
                    error?.response?.data?.message ?? "Something Went Wrong",
                );
            } finally {
                setIsLoading(false);
            }
        }
        FetchData();
    }, [method, url]);

    return { data, error, isLoading };
};
