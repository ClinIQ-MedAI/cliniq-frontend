import { http, HttpResponse } from "msw";
import { BASE_URL } from "../config";
import { loadState, saveState } from "../storage";

let availability = loadState("availability", [
    { dayOfWeek: 0, startTime: "09:00:00", endTime: "17:00:00" },
    { dayOfWeek: 1, startTime: "09:00:00", endTime: "17:00:00" },
    { dayOfWeek: 2, startTime: "09:00:00", endTime: "17:00:00" },
    { dayOfWeek: 3, startTime: "09:00:00", endTime: "17:00:00" },
    { dayOfWeek: 4, startTime: "09:00:00", endTime: "17:00:00" },
]);

let schedules = loadState("schedules", []);
let scheduleIdCounter = loadState("scheduleIdCounter", 1);

const generateFakeSchedules = (startDate, endDate) => {
    const result = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dow = d.getDay();
        if (!availability.some((a) => a.dayOfWeek === dow)) continue;
        result.push({
            id: scheduleIdCounter++,
            doctorId: "doctor-001",
            date: d.toISOString().split("T")[0],
            bookingCount: 0,
            isAvailable: true,
        });
    }
    return result;
};

export const scheduleHandlers = [
    http.post(`${BASE_URL}/schedules/availability`, async ({ request }) => {
        const body = await request.json();
        availability = body.availabilities;
        saveState("availability", availability);
        return new HttpResponse(null, { status: 200 });
    }),

    http.post(`${BASE_URL}/schedules/generate`, async ({ request }) => {
        const url = new URL(request.url);
        const startDate = url.searchParams.get("startDate");
        const endDate = url.searchParams.get("endDate");
        if (!startDate || !endDate) {
            return HttpResponse.json(
                { title: "startDate and endDate are required", status: 400 },
                { status: 400 },
            );
        }
        schedules = [
            ...schedules,
            ...generateFakeSchedules(startDate, endDate),
        ];
        saveState("schedules", schedules);
        saveState("scheduleIdCounter", scheduleIdCounter);
        return new HttpResponse(null, { status: 200 });
    }),

    http.get(`${BASE_URL}/schedules`, ({ request }) => {
        const url = new URL(request.url);
        const from = url.searchParams.get("from");
        const to = url.searchParams.get("to");
        let result = schedules;
        if (from) result = result.filter((s) => s.date >= from);
        if (to) result = result.filter((s) => s.date <= to);
        return HttpResponse.json(result);
    }),
];
