import * as signalR from "@microsoft/signalr";
import api from "./api"; // adjust path if this isn't dropped into src/apis/

const HUB_PATH = "/hubs/chat";

function getAccessToken() {
    return localStorage.getItem("cliniq_token");
}

function resolveHubUrl() {
    const base = api.defaults.baseURL ?? "";
    const root = base.replace(/\/api\/?$/, "");
    return `${root}${HUB_PATH}`;
}

class ChatSocketService {
    constructor() {
        this.connection = null;
        this.messageHandlers = new Set();
    }

    isConnected() {
        return this.connection?.state === signalR.HubConnectionState.Connected;
    }

    async connect() {
        if (this.isConnected()) return;

        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(resolveHubUrl(), {
                accessTokenFactory: getAccessToken,
                // 👈 مسحنا تحديد الـ transport عشان يقدر يعمل Fallback لو الـ WebSockets مقفولة
            })
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Warning)
            .build();

        this.connection.onreconnecting((error) => {
            console.warn("Chat socket: reconnecting…", error);
        });

        this.connection.onreconnected(() => {
            console.info("Chat socket: reconnected.");
        });

        this.connection.onclose((error) => {
            console.warn("Chat socket: connection closed.", error);
        });

        this.connection.on("ReceiveMessage", (payload) => {
            this.messageHandlers.forEach((handler) => handler(payload));
        });

        try {
            await this.connection.start();
            console.info("Chat socket: connected.");
        } catch (err) {
            console.error("Chat socket: failed to connect.", err);
            throw err;
        }
    }

    async disconnect() {
        if (this.connection) {
            await this.connection.stop();
            this.connection = null;
        }
    }

    async joinConversation(conversationId) {
        if (!this.isConnected()) return;
        try {
            await this.connection.invoke("JoinConversation", conversationId);
        } catch (err) {
            console.error("Chat socket: failed to join conversation", err);
        }
    }

    async leaveConversation(conversationId) {
        if (!this.isConnected()) return;
        try {
            await this.connection.invoke("LeaveConversation", conversationId);
        } catch (err) {
            console.error("Chat socket: failed to leave conversation", err);
        }
    }

    onMessage(handler) {
        this.messageHandlers.add(handler);
        return () => this.messageHandlers.delete(handler);
    }
}

const chatSocketService = new ChatSocketService();
export default chatSocketService;
