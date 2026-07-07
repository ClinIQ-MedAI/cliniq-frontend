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

const CONVERSATIONS_POLL_MS = 15000;
const MESSAGES_POLL_MS = 4000;
const NETWORK_DELAY_MS = 500;

/* ─── mock data ────────────────────────────────────────────── */
const MOCK_CONVERSATIONS = [
    {
        id: "c1",
        patientName: "Amelia Hart",
        lastMessageAt: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
        unreadCount: 2,
    },
    {
        id: "c2",
        patientName: "Daniel Osei",
        lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        unreadCount: 0,
    },
    {
        id: "c3",
        patientName: "Priya Nair",
        lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
        unreadCount: 1,
    },
    {
        id: "c4",
        patientName: "Marcus Webb",
        lastMessageAt: new Date(
            Date.now() - 1000 * 60 * 60 * 24 * 4,
        ).toISOString(),
        unreadCount: 0,
    },
    {
        id: "c5",
        patientName: "Sofia Ramirez",
        lastMessageAt: null,
        unreadCount: 0,
    },
];

const MOCK_MESSAGES = {
    c1: [
        {
            id: "m1",
            senderType: "PATIENT",
            content: "Hi Doctor, the new dosage seems to be helping.",
            createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
            status: "READ",
        },
        {
            id: "m2",
            senderType: "DOCTOR",
            content: "That's great to hear. Any side effects so far?",
            createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
            status: "READ",
        },
        {
            id: "m3",
            senderType: "PATIENT",
            content: "A little drowsiness in the morning, nothing major.",
            createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
            status: "READ",
        },
        {
            id: "m4",
            senderType: "PATIENT",
            content: "Should I keep taking it at the same time?",
            createdAt: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
            status: "DELIVERED",
        },
    ],
    c2: [
        {
            id: "m5",
            senderType: "DOCTOR",
            content: "Your labs came back normal. Nothing to worry about.",
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
            status: "READ",
        },
    ],
    c3: [
        {
            id: "m6",
            senderType: "PATIENT",
            content: "Can we move Thursday's appointment to Friday?",
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
            status: "DELIVERED",
        },
    ],
    c4: [
        {
            id: "m7",
            senderType: "DOCTOR",
            content: "Please remember to fast before the blood test.",
            createdAt: new Date(
                Date.now() - 1000 * 60 * 60 * 24 * 4,
            ).toISOString(),
            status: "READ",
        },
    ],
    c5: [],
};

/* mutable in-memory store so sends/reads persist while the page is open */
let conversationsStore = MOCK_CONVERSATIONS.map((c) => ({ ...c }));
let messagesStore = Object.fromEntries(
    Object.entries(MOCK_MESSAGES).map(([k, v]) => [
        k,
        v.map((m) => ({ ...m })),
    ]),
);
let idCounter = 1000;

const mockFetchConversations = () =>
    new Promise((resolve) => {
        setTimeout(() => {
            resolve([...conversationsStore]);
        }, NETWORK_DELAY_MS);
    });

const mockFetchMessages = (conversationId) =>
    new Promise((resolve) => {
        setTimeout(() => {
            resolve([...(messagesStore[conversationId] ?? [])]);
        }, NETWORK_DELAY_MS);
    });

const mockSendMessage = (conversationId, content) =>
    new Promise((resolve) => {
        setTimeout(() => {
            const message = {
                id: `m${idCounter++}`,
                senderType: "DOCTOR",
                content,
                createdAt: new Date().toISOString(),
                status: "DELIVERED",
            };
            messagesStore[conversationId] = [
                ...(messagesStore[conversationId] ?? []),
                message,
            ];
            conversationsStore = conversationsStore.map((c) =>
                c.id === conversationId
                    ? { ...c, lastMessageAt: message.createdAt }
                    : c,
            );
            resolve(message);
        }, NETWORK_DELAY_MS);
    });

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
                    <span className="shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-white text-xs font-semibold flex items-center justify-center">
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

    /* fetch conversations (mock) */
    const fetchConversations = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoadingConversations(true);
            const data = await mockFetchConversations();
            setConversations(
                [...data].sort(
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

    /* fetch messages for a conversation (mock) */
    const fetchMessages = useCallback(
        async (conversationId, silent = false) => {
            try {
                if (!silent) setLoadingMessages(true);
                const data = await mockFetchMessages(conversationId);
                // avoid clobbering state if user switched conversations mid-request
                if (selectedIdRef.current === conversationId) {
                    setMessages(data);
                }
            } catch (err) {
                if (!silent) showToast("Failed to load messages.");
            } finally {
                if (!silent) setLoadingMessages(false);
            }
        },
        [],
    );

    useEffect(() => {
        fetchConversations();
        const interval = setInterval(
            () => fetchConversations(true),
            CONVERSATIONS_POLL_MS,
        );
        return () => clearInterval(interval);
    }, [fetchConversations]);

    useEffect(() => {
        if (!selectedId) return;
        fetchMessages(selectedId);

        // opening a conversation reads it — reflect that locally right away
        setConversations((prev) =>
            prev.map((c) =>
                c.id === selectedId ? { ...c, unreadCount: 0 } : c,
            ),
        );

        const interval = setInterval(
            () => fetchMessages(selectedId, true),
            MESSAGES_POLL_MS,
        );
        return () => clearInterval(interval);
    }, [selectedId, fetchMessages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        const content = draft.trim();
        if (!content || !selectedId || sending) return;

        setSending(true);
        setDraft("");
        try {
            const data = await mockSendMessage(selectedId, content);
            setMessages((prev) => [...prev, data]);
            setConversations((prev) =>
                prev.map((c) =>
                    c.id === selectedId
                        ? { ...c, lastMessageAt: data.createdAt }
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
