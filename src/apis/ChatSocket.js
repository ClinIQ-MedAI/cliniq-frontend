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
        this.connectingPromise = null;
        // conversationIds the app currently wants to be joined to; used to
        // rejoin automatically after an auto-reconnect (which drops group
        // membership, since it's a brand new connectionId on the server)
        this.activeConversationIds = new Set();
    }

    isConnected() {
        return this.connection?.state === signalR.HubConnectionState.Connected;
    }

    async connect() {
        if (this.isConnected()) return;
        // if a connection attempt is already in flight, reuse it instead of
        // racing a second one / letting callers think we're connected too early
        if (this.connectingPromise) return this.connectingPromise;

        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(resolveHubUrl(), {
                accessTokenFactory: getAccessToken,
            })
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Warning)
            .build();

        this.connection.onreconnecting((error) => {
            console.warn("Chat socket: reconnecting…", error);
        });

        this.connection.onreconnected(async () => {
            console.info("Chat socket: reconnected.");
            // group membership does NOT survive a reconnect (it's a new
            // connectionId server-side), so rejoin whatever conversation(s)
            // were active before the drop
            for (const conversationId of this.activeConversationIds) {
                try {
                    await this.connection.invoke(
                        "JoinConversation",
                        conversationId,
                    );
                } catch (err) {
                    console.error(
                        "Chat socket: failed to rejoin conversation after reconnect",
                        err,
                    );
                }
            }
        });

        this.connection.onclose((error) => {
            console.warn("Chat socket: connection closed.", error);
        });

        this.connection.on("ReceiveMessage", (payload) => {
            console.log("📥 [Socket] Received Raw Payload:", payload);
            this.messageHandlers.forEach((handler) => handler(payload));
        });

        this.connectingPromise = this.connection
            .start()
            .then(() => {
                console.info("Chat socket: connected.");
            })
            .catch((err) => {
                console.error("Chat socket: failed to connect.", err);
                throw err;
            })
            .finally(() => {
                this.connectingPromise = null;
            });

        return this.connectingPromise;
    }

    async disconnect() {
        this.activeConversationIds.clear();
        // drop any pending connect() promise too — it's tied to the
        // connection we're about to stop, so reusing it after this point
        // would just resolve/reject against a dead connection and never
        // let a fresh connect() actually run
        this.connectingPromise = null;
        if (this.connection) {
            const conn = this.connection;
            this.connection = null;
            try {
                await conn.stop();
            } catch {
                // already stopping/stopped — fine to ignore
            }
        }
    }

    // Waits for any in-flight connect() to settle, then reports whether
    // we're actually connected. Callers should await this before invoking
    // hub methods right after mount, since connect() itself is fire-and-forget.
    async _ensureConnected() {
        if (this.connectingPromise) {
            try {
                await this.connectingPromise;
            } catch {
                return false;
            }
        }
        return this.isConnected();
    }

    async joinConversation(conversationId) {
        this.activeConversationIds.add(conversationId);
        if (!(await this._ensureConnected())) {
            console.warn(
                "⚠️ Chat socket: could not join conversation, not connected:",
                conversationId,
            );
            return;
        }
        try {
            await this.connection.invoke("JoinConversation", conversationId);
            console.log(
                "✅ Chat socket: joined conversation group:",
                conversationId,
            );
        } catch (err) {
            console.error("Chat socket: failed to join conversation", err);
        }
    }

    async leaveConversation(conversationId) {
        this.activeConversationIds.delete(conversationId);
        if (!(await this._ensureConnected())) return;
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
