import { http, HttpResponse } from "msw";
import { BASE_URL } from "../config";

let availability = [
    { dayOfWeek: 0, startTime: "09:00:00", endTime: "17:00:00" }, // Sunday
    { dayOfWeek: 1, startTime: "09:00:00", endTime: "17:00:00" }, // Monday
    { dayOfWeek: 2, startTime: "09:00:00", endTime: "17:00:00" }, // Tuesday
    { dayOfWeek: 3, startTime: "09:00:00", endTime: "17:00:00" }, // Wednesday
    { dayOfWeek: 4, startTime: "09:00:00", endTime: "17:00:00" }, // Thursday
];

// Simulate generated schedules
let schedules = [];

const generateFakeSchedules = (startDate, endDate) => {
    const result = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    let id = schedules.length + 1;

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dow = d.getDay();
        const isWorkingDay = availability.some((a) => a.dayOfWeek === dow);
        result.push({
            id: id++,
            date: d.toISOString().split("T")[0],
            dayName: d.toLocaleDateString("en-US", { weekday: "long" }),
            bookingCount: Math.floor(Math.random() * 5),
            maxBookings: 10,
            status: isWorkingDay
                ? Math.random() > 0.8
                    ? "Full"
                    : "Available"
                : "Closed",
            isAvailable: isWorkingDay,
        });
    }
    return result;
};

export const scheduleHandlers = [
    // POST /schedules/availability
    http.post(`${BASE_URL}/schedules/availability`, async ({ request }) => {
        const body = await request.json();
        availability = body.availabilities;
        return HttpResponse.json({
            message: "Availability saved successfully.",
        });
    }),

    // POST /schedules/generate
    http.post(`${BASE_URL}/schedules/generate`, async ({ request }) => {
        const url = new URL(request.url);
        const startDate =
            url.searchParams.get("startDate") ||
            new Date().toISOString().split("T")[0];
        const endDate =
            url.searchParams.get("endDate") ||
            new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];
        const newSchedules = generateFakeSchedules(startDate, endDate);
        schedules = [...schedules, ...newSchedules];
        return HttpResponse.json({
            message: "Schedule generated.",
            count: newSchedules.length,
        });
    }),

    // GET /schedules
    http.get(`${BASE_URL}/schedules`, ({ request }) => {
        const url = new URL(request.url);
        const from = url.searchParams.get("from");
        const to = url.searchParams.get("to");

        let result = schedules;
        if (from) result = result.filter((s) => s.date >= from);
        if (to) result = result.filter((s) => s.date <= to);

        // If no schedules yet, return generated ones on the fly
        if (result.length === 0) {
            const today = new Date().toISOString().split("T")[0];
            const nextMonth = new Date(Date.now() + 30 * 86400000)
                .toISOString()
                .split("T")[0];
            result = generateFakeSchedules(from || today, to || nextMonth);
        }

        return HttpResponse.json(result);
    }),
];
