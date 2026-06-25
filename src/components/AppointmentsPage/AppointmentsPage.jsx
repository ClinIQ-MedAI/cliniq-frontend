import React, { useState, useEffect } from "react";
import {
    Search,
    Check,
    X,
    ChevronLeft,
    ChevronRight,
    Frown,
} from "lucide-react";

const ini = (name = "") =>
    name
        .split(" ")
        .filter(Boolean)
        .map((p) => p[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const INITIAL = [
    {
        id: 1,
        name: "Shyam Khamo",
        disease: "Heart Disease",
        date: "Jan 27",
        status: "pending",
        visits: 3,
    },
    {
        id: 2,
        name: "Jean Lee Un",
        disease: "Heart Disease",
        date: "Jan 27",
        status: "approved",
        visits: 2,
    },
    {
        id: 3,
        name: "Clara Brook",
        disease: "Heart Disease",
        date: "Jan 27",
        status: "pending",
        visits: 5,
    },
    {
        id: 4,
        name: "Ahmed Ali",
        disease: "Cardiovascular",
        date: "Jan 28",
        status: "approved",
        visits: 7,
    },
    {
        id: 5,
        name: "Sarah Johnson",
        disease: "Pediatric Cardiology",
        date: "Jan 28",
        status: "rejected",
        visits: 1,
    },
    {
        id: 6,
        name: "Michael Brown",
        disease: "Heart Disease",
        date: "Jan 29",
        status: "pending",
        visits: 4,
    },
    {
        id: 7,
        name: "Emma Wilson",
        disease: "Cardiac Surgery",
        date: "Jan 29",
        status: "approved",
        visits: 6,
    },
    {
        id: 8,
        name: "David Lee",
        disease: "Preventive Cardiology",
        date: "Jan 30",
        status: "pending",
        visits: 2,
    },
    {
        id: 9,
        name: "Lisa Garcia",
        disease: "Heart Disease",
        date: "Jan 30",
        status: "approved",
        visits: 3,
    },
    {
        id: 10,
        name: "Robert Chen",
        disease: "Pediatric Cardiology",
        date: "Jan 31",
        status: "pending",
        visits: 4,
    },
];

const PER_PAGE = 5;
const FILTERS = ["all", "pending", "approved", "rejected"];

const METRIC_COLORS = {
    blue: "text-[#185FA5]",
    amber: "text-[#854F0B]",
    green: "text-[#0F6E56]",
    red: "text-[#A32D2D]",
};

function MetricCard({ value, label, color }) {
    return (
        <div className="bg-subtle rounded-lg px-4 py-3">
            <div className={`text-2xl font-medium ${METRIC_COLORS[color]}`}>
                {value}
            </div>
            <div className="text-xs text-slate-500 mt-1">{label}</div>
        </div>
    );
}

const PILL = {
    pending: "bg-[#FAEEDA] text-[#854F0B]",
    approved: "bg-[#E1F5EE] text-[#0F6E56]",
    rejected: "bg-[#FCEBEB] text-[#A32D2D]",
};

function StatusPill({ status }) {
    return (
        <span
            className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full ${PILL[status]}`}
        >
            {cap(status)}
        </span>
    );
}

function ActionBtn({ active, activeClass, onClick, label, children }) {
    return (
        <button
            onClick={onClick}
            aria-label={label}
            className={`w-[26px] h-[26px] rounded-md border flex items-center justify-center transition-colors cursor-pointer
        ${
            active
                ? activeClass
                : "border-border bg-card text-t3 hover:bg-subtle hover:text-t2"
        }`}
        >
            {children}
        </button>
    );
}

export default function AppointmentsPage() {
    const [data, setData] = useState(INITIAL);
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    useEffect(() => {
        setPage(1);
    }, [filter, search]);

    const filtered = data.filter((a) => {
        if (filter !== "all" && a.status !== filter) return false;
        if (search) {
            const q = search.toLowerCase();
            if (
                !a.name.toLowerCase().includes(q) &&
                !a.disease.toLowerCase().includes(q)
            )
                return false;
        }
        return true;
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    const safePage = Math.min(page, totalPages);
    const slice = filtered.slice(
        (safePage - 1) * PER_PAGE,
        safePage * PER_PAGE,
    );
    const start = filtered.length ? (safePage - 1) * PER_PAGE + 1 : 0;
    const end = Math.min(safePage * PER_PAGE, filtered.length);

    const toggle = (id, next) =>
        setData((prev) =>
            prev.map((a) =>
                a.id === id
                    ? { ...a, status: a.status === next ? "pending" : next }
                    : a,
            ),
        );

    const counts = {
        total: data.length,
        pending: data.filter((a) => a.status === "pending").length,
        approved: data.filter((a) => a.status === "approved").length,
        rejected: data.filter((a) => a.status === "rejected").length,
    };

    return (
        <div className="flex flex-col gap-5 pb-8 px-5 pt-3">
            <div>
                <h1 className="text-xl font-medium text-t1">
                    Appointment requests
                </h1>
                <p className="text-sm text-t2 mt-1">
                    Manage and review all appointment requests
                </p>
            </div>

            <div className="grid grid-cols-4 gap-3">
                <MetricCard value={counts.total} label="Total" color="blue" />
                <MetricCard
                    value={counts.pending}
                    label="Pending"
                    color="amber"
                />
                <MetricCard
                    value={counts.approved}
                    label="Approved"
                    color="green"
                />
                <MetricCard
                    value={counts.rejected}
                    label="Rejected"
                    color="red"
                />
            </div>

            <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[180px]">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search by name or condition…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-card text-t1 placeholder:text-t3 focus:outline-none focus:border-[#185FA5] transition-colors"
                    />
                </div>
                <div className="flex gap-1.5 flex-wrap">
                    {FILTERS.map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-full text-xs border transition-colors cursor-pointer
                ${
                    filter === f
                        ? "bg-[#EEF3FB] border-[#185FA5] text-[#185FA5] font-medium"
                        : "bg-card border-border text-t2 hover:bg-subtle hover:text-t1"
                }`}
                        >
                            {cap(f)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
                {slice.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-10 text-t2 text-sm">
                        <Frown className="w-7 h-7" />
                        <p>No appointments match your search.</p>
                        <button
                            onClick={() => {
                                setFilter("all");
                                setSearch("");
                            }}
                            className="mt-1 px-4 py-1.5 rounded-lg border border-slate-200 text-slate-600
                         text-sm hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                            Clear filters
                        </button>
                    </div>
                ) : (
                    <table className="w-full text-sm border-collapse table-fixed">
                        <colgroup>
                            <col className="w-[24%]" />
                            <col className="w-[22%]" />
                            <col className="w-[10%]" />
                            <col className="w-[11%]" />
                            <col className="w-[14%]" />
                            <col className="w-[19%]" />
                        </colgroup>
                        <thead>
                            <tr className="bg-subtle border-b border-border-sub">
                                {[
                                    "Patient",
                                    "Condition",
                                    "Date",
                                    "Visits",
                                    "Status",
                                    "Action",
                                ].map((h, i) => (
                                    <th
                                        key={h}
                                        className={`text-[11px] font-medium text-t3 px-3.5 py-2.5 text-left
                                ${i === 5 ? "text-center" : ""}`}
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {slice.map((a) => (
                                <tr
                                    key={a.id}
                                    className="border-b border-border-sub last:border-none hover:bg-subtle transition-colors"
                                >
                                    <td className="px-3.5 py-2.5">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-7 h-7 rounded-full bg-[#E6F1FB] text-[#0C447C] flex items-center
                                      justify-center text-[11px] font-medium shrink-0"
                                            >
                                                {ini(a.name)}
                                            </div>
                                            <span className="text-t1">
                                                {a.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-3.5 py-2.5 text-t2">
                                        {a.disease}
                                    </td>
                                    <td className="px-3.5 py-2.5 text-t2">
                                        {a.date}
                                    </td>
                                    <td className="px-3.5 py-2.5">
                                        <span className="text-[11px] bg-subtle text-t2 px-2 py-0.5 rounded-full">
                                            {a.visits}×
                                        </span>
                                    </td>
                                    <td className="px-3.5 py-2.5">
                                        <StatusPill status={a.status} />
                                    </td>
                                    <td className="">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <ActionBtn
                                                active={a.status === "approved"}
                                                activeClass="bg-[#E1F5EE] border-[#5DCAA5] text-[#085041]"
                                                onClick={() =>
                                                    toggle(a.id, "approved")
                                                }
                                                label={`Approve ${a.name}`}
                                            >
                                                <span
                                                    style={{
                                                        display: "flex",
                                                        width: 14,
                                                        height: 14,
                                                    }}
                                                >
                                                    <Check size={14} />
                                                </span>
                                            </ActionBtn>
                                            <ActionBtn
                                                active={a.status === "rejected"}
                                                activeClass="bg-[#FCEBEB] border-[#F09595] text-[#A32D2D]"
                                                onClick={() =>
                                                    toggle(a.id, "rejected")
                                                }
                                                label={`Reject ${a.name}`}
                                            >
                                                <span
                                                    style={{
                                                        display: "flex",
                                                        width: 14,
                                                        height: 14,
                                                    }}
                                                >
                                                    <X size={14} />
                                                </span>
                                            </ActionBtn>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {filtered.length > 0 && (
                    <div className="flex items-center justify-between px-3.5 py-2.5 border-t border-border-sub flex-wrap gap-2">
                        <span className="text-xs text-t3">
                            Showing {start}–{end} of {filtered.length}
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() =>
                                    setPage((p) => Math.max(p - 1, 1))
                                }
                                disabled={safePage === 1}
                                aria-label="Previous page"
                                className="w-7 h-7 flex items-center justify-center rounded-md border border-border bg-card text-t2 hover:bg-subtle disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            >
                                <span>
                                    <ChevronLeft className="w-4 h-4" />
                                </span>
                            </button>
                            {Array.from(
                                { length: totalPages },
                                (_, i) => i + 1,
                            ).map((n) => (
                                <button
                                    key={n}
                                    onClick={() => setPage(n)}
                                    aria-label={`Page ${n}`}
                                    aria-current={
                                        safePage === n ? "page" : undefined
                                    }
                                    className={`w-7 h-7 rounded-md border text-xs flex items-center justify-center
                              transition-colors cursor-pointer
                              ${
                                  safePage === n
                                      ? "bg-[#185FA5] border-[#185FA5] text-white font-medium"
                                      : "border-border bg-card text-t2 hover:bg-subtle"
                              }`}
                                >
                                    {n}
                                </button>
                            ))}
                            <button
                                onClick={() =>
                                    setPage((p) => Math.min(p + 1, totalPages))
                                }
                                disabled={safePage === totalPages}
                                aria-label="Previous page"
                                className="w-7 h-7 flex items-center justify-center rounded-md border border-border bg-card text-t2 hover:bg-subtle disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            >
                                <span>
                                    <ChevronRight
                                        className="w-4 h-4"
                                        size={10}
                                    />
                                </span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
