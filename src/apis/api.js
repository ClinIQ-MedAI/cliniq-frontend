import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_BASE_API,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("cliniq_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (response) => response, // Directly return successful responses
    (error) => {
        if (error.response) {
            const { status } = error.response;
            switch (status) {
                case 401:
                    console.error("Unauthorized");
                    // Handle unauthorized errors
                    break;
                case 404:
                    console.error("Not Found");
                    // Handle not found errors
                    break;
                case 500:
                    console.error("Server Error");
                    // Handle server errors
                    break;
                default:
                    console.error(`Error: ${status}`);
                // Handle other errors
            }
        } else if (error.request) {
            console.error("Network Error: No response received");
            // Handle network errors
        } else {
            console.error("Request setup error:", error.message);
            // Handle request setup errors
        }
        return Promise.reject(error); // Re-throw the error
    },
);

export default api;
