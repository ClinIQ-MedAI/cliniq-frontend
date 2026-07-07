import { http, HttpResponse } from "msw";
import { BASE_URL } from "../config";
import { fakeDoctor } from "./auth";
import { doctors } from "./admin";
import { loadState, saveState } from "../storage";

export const doctorHandlers = [
    // Always derive from fakeDoctor — keeps id in sync, no separate stale object
    http.get(`${BASE_URL}/doctor/me`, () => {
        return HttpResponse.json({
            id: fakeDoctor.id,
            firstName: fakeDoctor.firstName,
            lastName: fakeDoctor.lastName,
            email: fakeDoctor.email,
        });
    }),

    http.put(`${BASE_URL}/doctor/me`, async ({ request }) => {
        const body = await request.json();
        fakeDoctor.firstName = body.firstName;
        fakeDoctor.lastName = body.lastName;
        saveState("fakeDoctor", fakeDoctor);
        return new HttpResponse(null, { status: 204 });
    }),

    http.put(`${BASE_URL}/doctor/me/change-password`, async ({ request }) => {
        const body = await request.json();
        console.log("[MSW] Password changed:", body);
        return new HttpResponse(null, { status: 204 });
    }),

    http.post(`${BASE_URL}/doctor/Survey`, async () => {
        fakeDoctor.doctorStatus = "PENDING_VERIFICATION";
        saveState("fakeDoctor", fakeDoctor);

        const existingIndex = doctors.findIndex((d) => d.id === fakeDoctor.id);
        const adminFacingRecord = {
            id: fakeDoctor.id,
            firstName: fakeDoctor.firstName,
            lastName: fakeDoctor.lastName,
            email: fakeDoctor.email,
            isDisabled: false,
            status: "PENDING_VERIFICATION",
        };

        if (existingIndex >= 0) {
            doctors[existingIndex] = adminFacingRecord;
        } else {
            doctors.push(adminFacingRecord);
        }
        saveState("doctors", doctors);

        return HttpResponse.json({
            message: "Survey submitted. Awaiting admin verification.",
        });
    }),

    // Dummy — no real backend endpoint yet
    http.get(`${BASE_URL}/doctor/metrics`, () => {
        return HttpResponse.json({
            patientsTreated: "3,247",
            todaysAppointments: "18",
            monthlyRevenue: "$24,580",
            rating: "4.8",
            chartData: {
                months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                revenue: [18500, 21000, 19800, 23000, 24580, 22500],
                consultations: [7400, 8400, 7920, 9200, 9832, 9000],
            },
        });
    }),
];
