import { useEffect } from "react";
import api from "../apis/api";
import API_ENDPOINTS from "../apis/endpoints";
import { useState } from "react";

export const ConversationsPage = () => {
    /** @type {[import("../types").ConversationResponse[],Function]} */
    const [conversations, setConversations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        async function fetchConversations() {
            setIsLoading(true);
            try {
                /** @type {{data: import("../types").ConversationResponse[]}} */
                const response = await api.get(
                    API_ENDPOINTS.Chat.getConversations,
                );

                setConversations(response.data);
            } catch (error) {
                console.log(error);
                setError(error.response.data);
            } finally {
                setIsLoading(false);
            }
        }
        fetchConversations();
    }, []);
    return (
        <div>
            {isLoading && <div>Loading...</div>}
            {!isLoading &&
                !error &&
                conversations?.map((con) => <div key={con.id}></div>)}
        </div>
    );
};
