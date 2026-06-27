import { http, HttpResponse } from "msw";
import { BASE_URL } from "../config";
import { fakeDoctor } from "./auth";
import { doctorProfile } from "./doctor";

export let doctors = [
    {
        id: "doctor-001",
        firstName: "Ahmed",
        lastName: "Hassan",
        email: "doctor@cliniq.com",
        specialization: "Cardiology",
        licenseNumber: "LIC-2024-001",
        isDisabled: false,
        status: "INCOMPLETE_PROFILE",
    },
    {
        id: "doctor-002",
        firstName: "Mona",
        lastName: "Ibrahim",
        email: "mona@cliniq.com",
        specialization: "Dermatology",
        licenseNumber: "LIC-2024-002",
        isDisabled: false,
        status: "PENDING_VERIFICATION",
    },
    {
        id: "doctor-003",
        firstName: "Karim",
        lastName: "Saleh",
        email: "karim@cliniq.com",
        specialization: "Neurology",
        licenseNumber: "LIC-2024-003",
        isDisabled: false,
        status: "REJECTED",
    },
];

let patients = [
    {
        id: "patient-001",
        firstName: "Sara",
        lastName: "Mohamed",
        email: "sara@gmail.com",
        isDisabled: false,
        status: "ACTIVE",
    },
    {
        id: "patient-002",
        firstName: "Omar",
        lastName: "Khaled",
        email: "omar@gmail.com",
        isDisabled: false,
        status: "ACTIVE",
    },
    {
        id: "patient-003",
        firstName: "Nour",
        lastName: "Ahmed",
        email: "nour@gmail.com",
        isDisabled: true,
        status: "SUSPENDED",
    },
];

const bookings = [
    {
        id: 1,
        doctorName: "Ahmed Hassan",
        patientName: "Sara Mohamed",
        date: "2026-06-28",
        status: "CONFIRMED",
    },
    {
        id: 2,
        doctorName: "Ahmed Hassan",
        patientName: "Omar Khaled",
        date: "2026-06-28",
        status: "PENDING",
    },
    {
        id: 3,
        doctorName: "Mona Ibrahim",
        patientName: "Nour Ahmed",
        date: "2026-06-29",
        status: "COMPLETED",
    },
    {
        id: 4,
        doctorName: "Ahmed Hassan",
        patientName: "Sara Mohamed",
        date: "2026-06-30",
        status: "CANCELLED",
    },
];

export const adminHandlers = [
    // --- DOCTORS ---
    // GET /admin/doctors
    http.get(`${BASE_URL}/admin/doctors`, ({ request }) => {
        const url = new URL(request.url);
        const page = Number(url.searchParams.get("page") || 1);
        const pageSize = 10;
        const start = (page - 1) * pageSize;
        return HttpResponse.json({
            items: doctors.slice(start, start + pageSize),
            totalCount: doctors.length,
            page,
            pageSize,
        });
    }),

    // GET /admin/doctors/:id
    http.get(`${BASE_URL}/admin/doctors/:id`, ({ params }) => {
        const doc = doctors.find((d) => d.id === params.id);
        if (!doc)
            return HttpResponse.json(
                { message: "Doctor not found." },
                { status: 404 },
            );
        return HttpResponse.json(doc);
    }),

    // POST /admin/doctors
    http.post(`${BASE_URL}/admin/doctors`, async ({ request }) => {
        const body = await request.json();
        const newDoctor = {
            id: `doctor-00${doctors.length + 1}`,
            isDisabled: false,
            status: "ACTIVE",
            ...body,
        };
        doctors.push(newDoctor);
        return HttpResponse.json(newDoctor, { status: 201 });
    }),

    // PUT /admin/doctors/:id
    http.put(`${BASE_URL}/admin/doctors/:id`, async ({ request, params }) => {
        const body = await request.json();
        doctors = doctors.map((d) => {
            if (d.id === params.id) {
                fakeDoctor.doctorStatus = body.doctorStatus
                    ? body.doctorStatus
                    : fakeDoctor.doctorStatus;
                doctorProfile.status = body.doctorStatus;
                return { ...d, ...body };
            } else {
                return d;
            }
        });

        return HttpResponse.json(doctors.find((d) => d.id === params.id));
    }),

    // PATCH /admin/doctors/:id/status
    http.patch(
        `${BASE_URL}/admin/doctors/:id/status`,
        async ({ request, params }) => {
            const body = await request.json();
            doctors = doctors.map((d) => {
                if (d.id === params.id) {
                    doctorProfile.isDisabled = !body.active;
                    fakeDoctor.isDisabled = !body.active;
                    fakeDoctor.doctorStatus = "SUSPENDED";
                    doctorProfile.status = "SUSPENDED";
                    return { ...d, isDisabled: !body.active };
                } else {
                    return d;
                }
            });
            return HttpResponse.json({ message: "Status updated." });
        },
    ),

    // PUT /admin/doctors/:id/unlock
    http.put(`${BASE_URL}/admin/doctors/:id/unlock`, ({ params }) => {
        doctors = doctors.map((d) => {
            if (d.id === params.id) {
                doctorProfile.isDisabled = false;
                fakeDoctor.isDisabled = false;
                fakeDoctor.doctorStatus = "ACTIVE";
                doctorProfile.status = "ACTIVE";
                return { ...d, isDisabled: false };
            } else {
                return d;
            }
        });
        return HttpResponse.json({ message: "Doctor unlocked." });
    }),

    // POST /admin/doctors/:id/approve
    http.post(`${BASE_URL}/admin/doctors/:id/approve`, ({ params }) => {
        doctors = doctors.map((d) => {
            if (d.id === params.id) {
                fakeDoctor.doctorStatus = "ACTIVE";
                doctorProfile.status = "ACTIVE";
                return { ...d, status: "ACTIVE" };
            } else {
                return d;
            }
        });
        return HttpResponse.json({ message: "Doctor approved." });
    }),

    // POST /admin/doctors/:id/reject
    http.post(
        `${BASE_URL}/admin/doctors/:id/reject`,
        async ({ request, params }) => {
            const body = await request.json();
            doctors = doctors.map((d) =>
                d.id === params.id ? { ...d, status: "REJECTED" } : d,
            );
            console.log(
                `[MSW] Doctor ${params.id} rejected. Reason: ${body.reason}`,
            );
            return HttpResponse.json({ message: "Doctor rejected." });
        },
    ),

    // --- PATIENTS ---
    // GET /admin/patients
    http.get(`${BASE_URL}/admin/patients`, ({ request }) => {
        const url = new URL(request.url);
        const page = Number(url.searchParams.get("page") || 1);
        const pageSize = 10;
        const start = (page - 1) * pageSize;
        return HttpResponse.json({
            items: patients.slice(start, start + pageSize),
            totalCount: patients.length,
            page,
            pageSize,
        });
    }),

    // GET /admin/patients/:id
    http.get(`${BASE_URL}/admin/patients/:id`, ({ params }) => {
        const patient = patients.find((p) => p.id === params.id);
        if (!patient)
            return HttpResponse.json(
                { message: "Patient not found." },
                { status: 404 },
            );
        return HttpResponse.json(patient);
    }),

    // POST /admin/patients
    http.post(`${BASE_URL}/admin/patients`, async ({ request }) => {
        const body = await request.json();
        const newPatient = {
            id: `patient-00${patients.length + 1}`,
            isDisabled: false,
            status: "ACTIVE",
            ...body,
        };
        patients.push(newPatient);
        return HttpResponse.json(newPatient, { status: 201 });
    }),

    // PUT /admin/patients/:id
    http.put(`${BASE_URL}/admin/patients/:id`, async ({ request, params }) => {
        const body = await request.json();
        patients = patients.map((p) =>
            p.id === params.id ? { ...p, ...body } : p,
        );
        return HttpResponse.json(patients.find((p) => p.id === params.id));
    }),

    // PATCH /admin/patients/:id/status
    http.patch(
        `${BASE_URL}/admin/patients/:id/status`,
        async ({ request, params }) => {
            const body = await request.json();
            patients = patients.map((p) =>
                p.id === params.id ? { ...p, isDisabled: !body.active } : p,
            );
            return HttpResponse.json({ message: "Status updated." });
        },
    ),

    // PUT /admin/patients/:id/unlock
    http.put(`${BASE_URL}/admin/patients/:id/unlock`, ({ params }) => {
        patients = patients.map((p) =>
            p.id === params.id ? { ...p, isDisabled: false } : p,
        );
        return HttpResponse.json({ message: "Patient unlocked." });
    }),

    // --- BOOKINGS ---
    // GET /admin/bookings
    http.get(`${BASE_URL}/admin/bookings`, ({ request }) => {
        const url = new URL(request.url);
        const page = Number(url.searchParams.get("page") || 1);
        const pageSize = 10;
        const start = (page - 1) * pageSize;
        return HttpResponse.json({
            items: bookings.slice(start, start + pageSize),
            totalCount: bookings.length,
            page,
            pageSize,
        });
    }),
];
