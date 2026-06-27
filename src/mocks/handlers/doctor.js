import { http, HttpResponse } from "msw";
import { BASE_URL } from "../config";
import { doctors } from "./admin";
import { fakeDoctor } from "./auth";
// Our fake database of appointments
let allAppointments = [
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
export let doctorProfile = {
    id: "doctor-001",
    firstName: "Ahmed",
    lastName: "Hassan",
    email: "doctor@cliniq.com",
    dateOfBirth: "1990-05-15",
    gender: "Male",
    specialization: "Cardiology",
    licenseNumber: "LIC-2024-001",
    licenseExpiryDate: "2027-01-01",
    personalIdentityPhotoUrl: "",
    medicalLicenseUrl: "",
    status: "INCOMPLETE_PROFILE", // changes after survey
    isDisabled: false,
};

export const doctorHandlers = [
    // GET /doctor/me
    http.get(`${BASE_URL}/doctor/me`, () => {
        // ✅ Fix: Just return the profile as-is. It will default to "INCOMPLETE_PROFILE",
        // and then change to "PENDING_VERIFICATION" after the survey.
        return HttpResponse.json(doctorProfile);
    }),

    // PUT /doctor/me
    http.put(`${BASE_URL}/doctor/me`, async ({ request }) => {
        const body = await request.json();
        doctorProfile = { ...doctorProfile, ...body };
        return HttpResponse.json(doctorProfile);
    }),

    // PUT /doctor/me/change-password
    http.put(`${BASE_URL}/doctor/me/change-password`, async ({ request }) => {
        const body = await request.json();
        console.log("[MSW] Password changed:", body);
        return HttpResponse.json({ message: "Password changed successfully." });
    }),

    // POST /doctor/survey
    http.post(`${BASE_URL}/doctor/survey`, async ({ request }) => {
        const body = await request.json();

        // 1. Update the logged-in doctor's profile
        doctorProfile = {
            ...doctorProfile,
            specialization: body.specialization,
            licenseNumber: body.licenseNumber,
            licenseExpiryDate: body.licenseExpiryDate,
            personalIdentityPhotoUrl: body.personalIdentityPhotoUrl,
            medicalLicenseUrl: body.medicalLicenseUrl,
            status: "PENDING_VERIFICATION",
        };

        fakeDoctor.doctorStatus = "PENDING_VERIFICATION";

        // 2. Add or update this doctor in the Admin's "doctors" array!
        const existingIndex = doctors.findIndex(
            (d) => d.id === doctorProfile.id,
        );

        if (existingIndex >= 0) {
            // Update existing doctor in the array
            doctors[existingIndex] = {
                ...doctors[existingIndex],
                ...doctorProfile,
            };
        } else {
            // Or add them to the array if they aren't there yet
            doctors.push(doctorProfile);
        }

        return HttpResponse.json(
            { message: "Survey submitted. Awaiting admin verification." },
            { status: 201 },
        );
    }),

    http.get(`${BASE_URL}/doctor/appointments/pending`, () => {
        const pendingAppointments = allAppointments.filter(
            (appointment) => appointment.status === "pending",
        );
        return HttpResponse.json(pendingAppointments);
    }),

    // Get Dashboard Metrics (Revenue, etc.)
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
    http.get(`${BASE_URL}/doctor/appointments`, () => {
        return HttpResponse.json(allAppointments);
    }),

    // 2. Update Appointment Status
    http.patch(
        `${BASE_URL}/doctor/appointments/:id/status`,
        async ({ request, params }) => {
            const { id } = params;
            const body = await request.json();

            allAppointments = allAppointments.map((app) =>
                app.id === Number(id) ? { ...app, status: body.status } : app,
            );

            return HttpResponse.json({
                message: "Status updated successfully",
            });
        },
    ),
];
