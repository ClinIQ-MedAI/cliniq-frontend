import React, {
    useState,
    useEffect,
    useRef,
    useMemo,
    useCallback,
} from "react";
import {
    Search,
    Send,
    ArrowLeft,
    MessageSquare,
    Check,
    CheckCheck,
    Loader2,
} from "lucide-react";
import api from "../apis/api";
import API_ENDPOINTS from "../apis/endpoints";
import chatSocketService from "../apis/ChatSocket";

// Kept as a periodic fallback sync for the conversation list (unread counts /
// ordering) in case a socket event is ever missed. Real-time updates for an
// open conversation now come from the socket, not from polling messages.
const CONVERSATIONS_POLL_MS = 30000;

/* ─── enum maps (see "Common Enums" in socket_documentation.md) ───────── */
const SENDER_TYPE_MAP = { 0: "DOCTOR", 1: "PATIENT" };
const STATUS_MAP = { 0: "SENT", 1: "DELIVERED", 2: "READ" };

// REST message responses already have shape { id, senderType, status, ... }.
// senderType/status may arrive as numeric enum indices or as strings
// depending on the backend's JSON serialization config — normalize both.
function normalizeRestMessage(raw) {
    return {
        ...raw,
        senderType: SENDER_TYPE_MAP[raw.senderType] ?? raw.senderType,
        status: STATUS_MAP[raw.status] ?? raw.status,
    };
}

// ReceiveMessage socket payloads use `messageId` instead of `id` and don't
// include a `status` field — treat freshly pushed messages as DELIVERED.
function normalizeSocketMessage(raw) {
    return {
        id: raw.messageId,
        conversationId: raw.conversationId,
        senderId: raw.senderId,
        senderType: SENDER_TYPE_MAP[raw.senderType] ?? raw.senderType,
        content: raw.content,
        createdAt: raw.createdAt,
        status: "DELIVERED",
    };
}

/* ─── helpers ──────────────────────────────────────────────── */
const ini = (name = "") =>
    name
        .split(" ")
        .filter(Boolean)
        .map((p) => p[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

const isToday = (date) => {
    const now = new Date();
    return (
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
    );
};

const isYesterday = (date) => {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    return (
        date.getDate() === y.getDate() &&
        date.getMonth() === y.getMonth() &&
        date.getFullYear() === y.getFullYear()
    );
};

const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
    });

const formatConversationTimestamp = (iso) => {
    if (!iso) return "";
    const date = new Date(iso);
    if (isToday(date)) return formatTime(iso);
    if (isYesterday(date)) return "Yesterday";
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
};

/* ─── conversation list item ──────────────────────────────── */
const ConversationItem = ({ conversation, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-border-sub transition-colors cursor-pointer
        ${isActive ? "bg-subtle" : "hover:bg-subtle/60"}`}
    >
        <div className="w-11 h-11 shrink-0 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center text-sm">
            {ini(conversation.patientName)}
        </div>
        <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-t1 truncate">
                    {conversation.patientName}
                </span>
                <span className="text-xs text-t3 shrink-0">
                    {formatConversationTimestamp(conversation.lastMessageAt)}
                </span>
            </div>
            <div className="flex items-center justify-between gap-2 mt-0.5">
                <span className="text-sm text-t2 truncate">
                    {conversation.lastMessageAt
                        ? "Tap to view conversation"
                        : "No messages yet"}
                </span>
                {conversation.unreadCount > 0 && (
                    <span className="shrink-0 min-w-5 h-5 px-1.5 rounded-full bg-primary text-white text-xs font-semibold flex items-center justify-center">
                        {conversation.unreadCount}
                    </span>
                )}
            </div>
        </div>
    </button>
);

/* ─── message bubble ──────────────────────────────────────── */
const MessageBubble = ({ message }) => {
    const isMine = message.senderType === "DOCTOR";
    return (
        <div
            className={`flex ${isMine ? "justify-end" : "justify-start"} mb-3`}
        >
            <div
                className={`max-w-[75%] sm:max-w-[65%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed
        ${
            isMine
                ? "bg-primary text-white rounded-br-sm"
                : "bg-card border border-border text-t1 rounded-bl-sm"
        }`}
            >
                <p className="whitespace-pre-wrap wrap-break-word">
                    {message.content}
                </p>
                <div
                    className={`flex items-center gap-1 mt-1 text-[11px] ${
                        isMine ? "text-white/70 justify-end" : "text-t3"
                    }`}
                >
                    <span>{formatTime(message.createdAt)}</span>
                    {isMine &&
                        (message.status === "READ" ? (
                            <CheckCheck size={13} />
                        ) : (
                            <Check size={13} />
                        ))}
                </div>
            </div>
        </div>
    );
};

/* ─── main page ────────────────────────────────────────────── */
export default function ChatPage() {
    const [conversations, setConversations] = useState([]);
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [search, setSearch] = useState("");

    const [selectedId, setSelectedId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(false);

    const [draft, setDraft] = useState("");
    const [sending, setSending] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);

    const messagesEndRef = useRef(null);
    const selectedIdRef = useRef(null);
    selectedIdRef.current = selectedId;

    const showToast = (text) => {
        setToastMessage(text);
        setTimeout(() => setToastMessage(null), 2500);
    };

    const selectedConversation = useMemo(
        () => conversations.find((c) => c.id === selectedId) ?? null,
        [conversations, selectedId],
    );

    const filteredConversations = useMemo(() => {
        if (!search.trim()) return conversations;
        const q = search.toLowerCase();
        return conversations.filter((c) =>
            c.patientName.toLowerCase().includes(q),
        );
    }, [conversations, search]);

    /* --- REST: conversation list --- */
    const fetchConversations = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoadingConversations(true);
            const { data } = await api.get(API_ENDPOINTS.Chat.getConversations);
            setConversations(
                [...(data ?? [])].sort(
                    (a, b) =>
                        new Date(b.lastMessageAt ?? 0) -
                        new Date(a.lastMessageAt ?? 0),
                ),
            );
        } catch (err) {
            if (!silent) showToast("Failed to load conversations.");
        } finally {
            if (!silent) setLoadingConversations(false);
        }
    }, []);

    /* --- REST: messages for a conversation --- */
    /* Note: per the docs, GET messages marks the patient's messages as READ
       as a side effect — so re-calling this for the open conversation also
       keeps read receipts in sync. */
    const fetchMessages = useCallback(
        async (conversationId, silent = false) => {
            try {
                if (!silent) setLoadingMessages(true);
                const { data } = await api.get(
                    API_ENDPOINTS.Chat.getMessages(conversationId),
                );
                // avoid clobbering state if the user switched conversations mid-request
                if (selectedIdRef.current === conversationId) {
                    setMessages((data ?? []).map(normalizeRestMessage));
                }
            } catch (err) {
                if (!silent) showToast("Failed to load messages.");
            } finally {
                if (!silent) setLoadingMessages(false);
            }
        },
        [],
    );

    /* --- conversations: initial load + periodic fallback sync --- */
    useEffect(() => {
        fetchConversations();
        const interval = setInterval(
            () => fetchConversations(true),
            CONVERSATIONS_POLL_MS,
        );
        return () => clearInterval(interval);
    }, [fetchConversations]);

    /* --- socket: connect once on mount, disconnect on unmount --- */
    useEffect(() => {
        chatSocketService.connect().catch(() => {
            showToast(
                "Couldn't connect to live chat — messages will still load, just not instantly.",
            );
        });

        const unsubscribe = chatSocketService.onMessage((payload) => {
            const message = normalizeSocketMessage(payload);

            if (message.conversationId === selectedIdRef.current) {
                // Message for the conversation currently open — append locally,
                // then silently re-fetch so the READ side effect fires.
                setMessages((prev) =>
                    prev.some((m) => m.id === message.id)
                        ? prev
                        : [...prev, message],
                );
                fetchMessages(message.conversationId, true);
            } else {
                // Message for a conversation not currently open — bump its
                // preview/unread count. If it's a brand-new conversation we
                // haven't seen yet, just resync the whole list.
                setConversations((prev) => {
                    const exists = prev.some(
                        (c) => c.id === message.conversationId,
                    );
                    if (!exists) {
                        fetchConversations(true);
                        return prev;
                    }
                    return prev.map((c) =>
                        c.id === message.conversationId
                            ? {
                                  ...c,
                                  lastMessageAt: message.createdAt,
                                  unreadCount: (c.unreadCount ?? 0) + 1,
                              }
                            : c,
                    );
                });
            }
        });

        return () => {
            unsubscribe();
            chatSocketService.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* --- messages + join/leave group for whichever conversation is open --- */
    useEffect(() => {
        if (!selectedId) return;

        fetchMessages(selectedId);
        chatSocketService.joinConversation(selectedId);

        // opening a conversation reads it — reflect that locally right away
        setConversations((prev) =>
            prev.map((c) =>
                c.id === selectedId ? { ...c, unreadCount: 0 } : c,
            ),
        );

        return () => {
            chatSocketService.leaveConversation(selectedId);
        };
    }, [selectedId, fetchMessages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    /* --- REST: send message --- */
    const handleSend = async (e) => {
        e.preventDefault();
        const content = draft.trim();
        if (!content || !selectedId || sending) return;

        setSending(true);
        setDraft("");
        try {
            const { data } = await api.post(
                API_ENDPOINTS.Chat.sendMessage(selectedId),
                { content },
            );
            const message = normalizeRestMessage(data);
            setMessages((prev) => [...prev, message]);
            setConversations((prev) =>
                prev.map((c) =>
                    c.id === selectedId
                        ? { ...c, lastMessageAt: message.createdAt }
                        : c,
                ),
            );
        } catch (err) {
            showToast("Failed to send message.");
            setDraft(content);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="h-[calc(100vh-64px)] flex bg-page relative">
            {toastMessage && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 bg-t1 text-white text-sm px-4 py-2 rounded-lg shadow-lg">
                    {toastMessage}
                </div>
            )}

            {/* Conversation list */}
            <aside
                className={`w-full md:w-80 shrink-0 border-r border-border bg-card flex flex-col
                ${selectedId ? "hidden md:flex" : "flex"}`}
            >
                <div className="p-4 border-b border-border">
                    <h1 className="text-lg font-semibold text-t1 mb-3">
                        Messages
                    </h1>
                    <div className="relative">
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-t3"
                        />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search patients"
                            className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-page
                            text-t1 placeholder:text-t3 focus:outline-none focus:border-primary"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loadingConversations ? (
                        <div className="flex items-center justify-center py-10 text-t3">
                            <Loader2 className="animate-spin" size={22} />
                        </div>
                    ) : filteredConversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 px-4 text-center text-t3 gap-2">
                            <MessageSquare size={28} />
                            <p className="text-sm">
                                {search
                                    ? "No patients match your search."
                                    : "No conversations yet."}
                            </p>
                        </div>
                    ) : (
                        filteredConversations.map((c) => (
                            <ConversationItem
                                key={c.id}
                                conversation={c}
                                isActive={c.id === selectedId}
                                onClick={() => setSelectedId(c.id)}
                            />
                        ))
                    )}
                </div>
            </aside>

            {/* Chat window */}
            <section
                className={`flex-1 flex-col min-w-0
                ${selectedId ? "flex" : "hidden md:flex"}`}
            >
                {!selectedConversation ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-t3 gap-2">
                        <MessageSquare size={36} />
                        <p className="text-sm">
                            Select a conversation to start chatting
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
                            <button
                                className="md:hidden text-t2 hover:text-t1"
                                onClick={() => setSelectedId(null)}
                                aria-label="Back to conversations"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center text-sm">
                                {ini(selectedConversation.patientName)}
                            </div>
                            <div className="min-w-0">
                                <div className="font-medium text-t1 truncate">
                                    {selectedConversation.patientName}
                                </div>
                                <div className="text-xs text-t3">Patient</div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-4 py-4">
                            {loadingMessages ? (
                                <div className="flex items-center justify-center h-full text-t3">
                                    <Loader2
                                        className="animate-spin"
                                        size={22}
                                    />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-t3 text-sm">
                                    No messages yet — say hello.
                                </div>
                            ) : (
                                <>
                                    {messages.map((m) => (
                                        <MessageBubble key={m.id} message={m} />
                                    ))}
                                    <div ref={messagesEndRef} />
                                </>
                            )}
                        </div>

                        <form
                            onSubmit={handleSend}
                            className="flex items-center gap-2 p-3 border-t border-border bg-card"
                        >
                            <input
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                placeholder="Type a message"
                                className="flex-1 px-4 py-2.5 text-sm border border-border rounded-full bg-page
                                text-t1 placeholder:text-t3 focus:outline-none focus:border-primary"
                            />
                            <button
                                type="submit"
                                disabled={!draft.trim() || sending}
                                className="w-10 h-10 shrink-0 rounded-full bg-primary text-white flex items-center justify-center
                                disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity cursor-pointer"
                                aria-label="Send message"
                            >
                                {sending ? (
                                    <Loader2
                                        className="animate-spin"
                                        size={18}
                                    />
                                ) : (
                                    <Send size={18} />
                                )}
                            </button>
                        </form>
                    </>
                )}
            </section>
        </div>
    );
}
