import { useState, useEffect } from "react";
import {
    Moon,
    Sun,
    Search,
    Mail,
    MailOpen,
    Loader2,
    MessageSquare,
    X,
    Send,
    CheckCircle2,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import api from "../apis/api";
import { toast } from "react-hot-toast";
import API_ENDPOINTS from "../apis/endpoints";

const STATUS_CONFIG = {
    unread: {
        label: "Unread",
        cls: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    },
    read: {
        label: "Read",
        cls: "bg-green-500/10 text-green-600 dark:text-green-400",
    },
};

const StatusBadge = ({ isRead }) => {
    const cfg = isRead ? STATUS_CONFIG.read : STATUS_CONFIG.unread;
    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}
        >
            {cfg.label}
        </span>
    );
};

const formatDate = (iso) =>
    iso
        ? new Date(iso).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
          })
        : "—";

/* ── Message detail modal ── */
const MessageModal = ({ message, onClose, onReply }) => {
    const [reply, setReply] = useState(message.adminReply ?? "");
    const [isSending, setIsSending] = useState(false);
    const alreadyReplied = Boolean(message.isReplied);

    const handleSend = async () => {
        if (!reply.trim()) {
            toast.error("Please write a reply before sending.");
            return;
        }
        setIsSending(true);
        try {
            await onReply(message.id, reply.trim());
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
            onClick={onClose}
        >
            <div
                className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="min-w-0">
                        <h3 className="text-lg font-bold text-t1 break-words">
                            {message.subject}
                        </h3>
                        <p className="text-sm text-t2 mt-0.5 break-words">
                            {message.name} · {message.email}
                            {message.phone ? ` · ${message.phone}` : ""}
                        </p>
                        <p className="text-xs text-t3 mt-0.5">
                            {formatDate(message.createdAt)}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-t3 hover:text-t1 hover:bg-subtle rounded-full transition-colors shrink-0"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="bg-subtle border border-border rounded-xl p-4 text-sm text-t1 whitespace-pre-wrap mb-4 max-h-48 overflow-y-auto">
                    {message.message}
                </div>

                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-medium text-t2 block">
                            {alreadyReplied ? "Your reply" : "Reply"}
                        </label>
                        {alreadyReplied && (
                            <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
                                <CheckCircle2 size={13} />
                                Sent
                            </span>
                        )}
                    </div>
                    <textarea
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        rows={3}
                        disabled={isSending || alreadyReplied}
                        placeholder="Write your reply to this message..."
                        className={`w-full px-4 py-3 rounded-xl border-2 border-border text-sm text-t1 bg-page focus:outline-none focus:border-primary transition-colors resize-none ${
                            alreadyReplied
                                ? "opacity-70 cursor-not-allowed"
                                : ""
                        }`}
                    />
                    {!alreadyReplied && (
                        <button
                            onClick={handleSend}
                            disabled={isSending}
                            className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isSending ? (
                                <Loader2 size={15} className="animate-spin" />
                            ) : (
                                <Send size={15} />
                            )}
                            Send Reply
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const PAGE_SIZE_FILTERS = ["all", "unread", "read"];

export const AdminContactUs = () => {
    const { toggle, theme } = useTheme();

    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [filter, setFilter] = useState("all");
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [markingId, setMarkingId] = useState(null);

    useEffect(() => {
        fetchMessages();
    }, []);

    async function fetchMessages() {
        try {
            setIsLoading(true);
            setError("");
            const res = await api.get(
                API_ENDPOINTS.Admin.Contact.getAllMessages,
            );
            setMessages(res.data ?? []);
        } catch (err) {
            setError(
                err?.response?.data?.title ??
                    err?.response?.data?.message ??
                    "Failed to load contact messages.",
            );
        } finally {
            setIsLoading(false);
        }
    }

    const handleOpenMessage = async (message) => {
        setSelectedMessage(message);
        if (!message.isRead) {
            markAsRead(message.id);
        }
    };

    const markAsRead = async (id) => {
        setMarkingId(id);
        try {
            await api.put(API_ENDPOINTS.Admin.Contact.markAsRead(id));
            setMessages((prev) =>
                prev.map((m) => (m.id === id ? { ...m, isRead: true } : m)),
            );
        } catch {
            toast.error("Failed to mark message as read.");
        } finally {
            setMarkingId(null);
        }
    };

    const handleReply = async (id, replyText) => {
        try {
            await api.post(API_ENDPOINTS.Admin.Contact.reply(id), {
                contactId: id,
                reply: replyText,
            });

            setMessages((prev) =>
                prev.map((m) =>
                    m.id === id
                        ? { ...m, isReplied: true, adminReply: replyText }
                        : m,
                ),
            );
            setSelectedMessage((prev) =>
                prev && prev.id === id
                    ? { ...prev, isReplied: true, adminReply: replyText }
                    : prev,
            );
            toast.success("Reply sent.");
        } catch (err) {
            toast.error(
                err?.response?.data?.title ??
                    err?.response?.data?.message ??
                    "Failed to send reply.",
            );
        }
    };

    const filteredMessages = messages.filter((m) => {
        const matchesSearch =
            searchInput === "" ||
            m.name?.toLowerCase().includes(searchInput.toLowerCase()) ||
            m.email?.toLowerCase().includes(searchInput.toLowerCase()) ||
            m.subject?.toLowerCase().includes(searchInput.toLowerCase());

        const matchesFilter =
            filter === "all" ||
            (filter === "unread" && !m.isRead) ||
            (filter === "read" && m.isRead);

        return matchesSearch && matchesFilter;
    });

    const unreadCount = messages.filter((m) => !m.isRead).length;

    return (
        <div className="bg-page w-full px-4 sm:px-5 py-2 min-h-screen">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-t1">
                        Contact Messages
                    </h2>
                    <p className="text-t2 mt-1">
                        {unreadCount > 0
                            ? `${unreadCount} unread message${unreadCount > 1 ? "s" : ""} from patients.`
                            : "All messages have been read."}
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative w-full md:w-64">
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-t3 pointer-events-none"
                        />
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search messages..."
                            className="w-full pl-9 pr-4 py-2 bg-subtle border border-border rounded-lg text-t1 text-sm focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-4 py-2 bg-subtle border border-border rounded-lg text-t1 text-sm focus:outline-none focus:border-primary transition-colors"
                    >
                        {PAGE_SIZE_FILTERS.map((f) => (
                            <option key={f} value={f}>
                                {f === "all"
                                    ? "All Messages"
                                    : f === "unread"
                                      ? "Unread"
                                      : "Read"}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={toggle}
                        className="p-2 text-t2 hover:text-primary hover:bg-subtle rounded-full transition-colors"
                    >
                        {theme === "light" ? (
                            <Moon size={22} />
                        ) : (
                            <Sun size={22} />
                        )}
                    </button>
                </div>
            </header>

            {/* Table */}
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-left border-collapse">
                        <thead>
                            <tr className="bg-subtle text-t2 text-sm border-b border-border">
                                <th className="p-4 font-medium">Sender</th>
                                <th className="p-4 font-medium">Subject</th>
                                <th className="p-4 font-medium">Message</th>
                                <th className="p-4 font-medium">Date</th>
                                <th className="p-4 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="py-12 text-center text-t3"
                                    >
                                        <Loader2
                                            size={24}
                                            className="animate-spin mx-auto mb-2"
                                            style={{ color: "#185FA5" }}
                                        />
                                        Loading messages...
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="py-12 text-center text-red-600 text-sm"
                                    >
                                        {error}
                                    </td>
                                </tr>
                            ) : filteredMessages.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="py-12 text-center text-t3 text-sm"
                                    >
                                        <MessageSquare
                                            size={24}
                                            className="mx-auto mb-2 text-t3"
                                        />
                                        No messages found.
                                    </td>
                                </tr>
                            ) : (
                                filteredMessages.map((message) => (
                                    <tr
                                        key={message.id}
                                        onClick={() =>
                                            handleOpenMessage(message)
                                        }
                                        className={`border-b border-border hover:bg-subtle transition-colors cursor-pointer ${
                                            !message.isRead ? "font-medium" : ""
                                        }`}
                                    >
                                        <td className="p-4 text-t1">
                                            <div className="flex flex-col">
                                                <span>{message.name}</span>
                                                <span className="text-xs text-t3 font-normal">
                                                    {message.email}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-t1 text-sm">
                                            {message.subject}
                                        </td>
                                        <td className="p-4 text-t2 text-sm max-w-xs truncate">
                                            {message.message}
                                        </td>
                                        <td className="p-4 text-t2 text-sm whitespace-nowrap">
                                            {formatDate(message.createdAt)}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {markingId === message.id ? (
                                                    <Loader2
                                                        size={16}
                                                        className="animate-spin text-t3"
                                                    />
                                                ) : message.isRead ? (
                                                    <MailOpen
                                                        size={15}
                                                        className="text-t3"
                                                    />
                                                ) : (
                                                    <Mail
                                                        size={15}
                                                        className="text-primary"
                                                    />
                                                )}
                                                <StatusBadge
                                                    isRead={message.isRead}
                                                />
                                                {message.isReplied && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                                        <CheckCircle2
                                                            size={12}
                                                        />
                                                        Replied
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail modal */}
            {selectedMessage && (
                <MessageModal
                    message={selectedMessage}
                    onClose={() => setSelectedMessage(null)}
                    onReply={handleReply}
                />
            )}
        </div>
    );
};
