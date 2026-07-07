import { http, HttpResponse } from "msw";
import { BASE_URL } from "../config";
import { fakeDoctor } from "./auth";
import { loadState, saveState } from "../storage";

export let doctors = loadState("doctors", [
    {
        id: "doctor-001",
        firstName: "Ahmed",
        lastName: "Hassan",
        email: "doctor@cliniq.com",
        isDisabled: false,
        status: "INCOMPLETE_PROFILE",
    },
    {
        id: "doctor-002",
        firstName: "Mona",
        lastName: "Ibrahim",
        email: "mona@cliniq.com",
        isDisabled: false,
        status: "PENDING_VERIFICATION",
    },
    {
        id: "doctor-003",
        firstName: "Karim",
        lastName: "Saleh",
        email: "karim@cliniq.com",
        isDisabled: false,
        status: "REJECTED",
    },
]);

let patients = loadState("patients", [
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
]);

let bookings = loadState("bookings", [
    {
        id: 1,
        date: "2026-06-28",
        patientName: "Sara Mohamed",
        doctorName: "Ahmed Hassan",
        status: "CONFIRMED",
    },
    {
        id: 2,
        date: "2026-06-28",
        patientName: "Omar Khaled",
        doctorName: "Ahmed Hassan",
        status: "PENDING",
    },
    {
        id: 3,
        date: "2026-06-29",
        patientName: "Nour Ahmed",
        doctorName: "Mona Ibrahim",
        status: "COMPLETED",
    },
    {
        id: 4,
        date: "2026-06-30",
        patientName: "Sara Mohamed",
        doctorName: "Ahmed Hassan",
        status: "CANCELLED",
    },
]);

export const adminHandlers = [
    http.get(`${BASE_URL}/admin/Doctors`, () => HttpResponse.json(doctors)),

    http.get(`${BASE_URL}/admin/Doctors/:id`, ({ params }) => {
        const doc = doctors.find((d) => d.id === params.id);
        return doc
            ? HttpResponse.json(doc)
            : HttpResponse.json(
                  { message: "Doctor not found." },
                  { status: 404 },
              );
    }),

    http.post(`${BASE_URL}/admin/Doctors`, async ({ request }) => {
        const body = await request.json();
        const newDoctor = {
            id: crypto.randomUUID(),
            firstName: body.firstName,
            lastName: body.lastName,
            email: body.email,
            isDisabled: false,
            status: "ACTIVE",
        };
        doctors.push(newDoctor);
        saveState("doctors", doctors);
        return HttpResponse.json(newDoctor, { status: 201 });
    }),

    http.put(`${BASE_URL}/admin/Doctors/:id`, async ({ request, params }) => {
        const body = await request.json();
        doctors = doctors.map((d) => {
            if (d.id !== params.id) return d;
            if (body.status) {
                fakeDoctor.doctorStatus = body.status;
                saveState("fakeDoctor", fakeDoctor);
            }
            return {
                ...d,
                firstName: body.firstName ?? d.firstName,
                lastName: body.lastName ?? d.lastName,
                email: body.email ?? d.email,
                status: body.status ?? d.status,
            };
        });
        saveState("doctors", doctors);
        return new HttpResponse(null, { status: 204 });
    }),

    http.patch(
        `${BASE_URL}/admin/Doctors/:id/status`,
        async ({ request, params }) => {
            const body = await request.json();
            doctors = doctors.map((d) => {
                if (d.id !== params.id) return d;
                if (d.id === fakeDoctor.id) {
                    fakeDoctor.doctorStatus = body.active
                        ? "ACTIVE"
                        : "SUSPENDED";
                    saveState("fakeDoctor", fakeDoctor);
                }
                return { ...d, isDisabled: !body.active };
            });
            saveState("doctors", doctors);
            return new HttpResponse(null, { status: 204 });
        },
    ),

    http.put(`${BASE_URL}/admin/Doctors/:id/unlock`, ({ params }) => {
        doctors = doctors.map((d) => {
            if (d.id !== params.id) return d;
            if (d.id === fakeDoctor.id) {
                fakeDoctor.doctorStatus = "ACTIVE";
                saveState("fakeDoctor", fakeDoctor);
            }
            return { ...d, isDisabled: false };
        });
        saveState("doctors", doctors);
        return new HttpResponse(null, { status: 204 });
    }),

    http.post(`${BASE_URL}/admin/Doctors/:id/approve`, ({ params }) => {
        doctors = doctors.map((d) => {
            if (d.id !== params.id) return d;
            if (d.id === fakeDoctor.id) {
                fakeDoctor.doctorStatus = "ACTIVE";
                saveState("fakeDoctor", fakeDoctor);
            }
            return { ...d, status: "ACTIVE" };
        });
        saveState("doctors", doctors);
        return new HttpResponse(null, { status: 204 });
    }),

    http.post(
        `${BASE_URL}/admin/Doctors/:id/reject`,
        async ({ request, params }) => {
            const body = await request.json();
            doctors = doctors.map((d) =>
                d.id === params.id ? { ...d, status: "REJECTED" } : d,
            );
            saveState("doctors", doctors);
            console.log(
                `[MSW] Doctor ${params.id} rejected. Reason: ${body.reason}`,
            );
            return new HttpResponse(null, { status: 204 });
        },
    ),

    // --- PATIENTS ---
    http.get(`${BASE_URL}/admin/Patients`, () => HttpResponse.json(patients)),

    http.get(`${BASE_URL}/admin/Patients/:id`, ({ params }) => {
        const patient = patients.find((p) => p.id === params.id);
        return patient
            ? HttpResponse.json(patient)
            : HttpResponse.json(
                  { message: "Patient not found." },
                  { status: 404 },
              );
    }),

    http.post(`${BASE_URL}/admin/Patients`, async ({ request }) => {
        const body = await request.json();
        const newPatient = {
            id: crypto.randomUUID(),
            firstName: body.firstName,
            lastName: body.lastName,
            email: body.email,
            isDisabled: false,
            status: "ACTIVE",
        };
        patients.push(newPatient);
        saveState("patients", patients);
        return HttpResponse.json(newPatient, { status: 201 });
    }),

    http.put(`${BASE_URL}/admin/Patients/:id`, async ({ request, params }) => {
        const body = await request.json();
        patients = patients.map((p) =>
            p.id === params.id ? { ...p, ...body } : p,
        );
        saveState("patients", patients);
        return new HttpResponse(null, { status: 204 });
    }),

    http.patch(
        `${BASE_URL}/admin/Patients/:id/status`,
        async ({ request, params }) => {
            const body = await request.json();
            patients = patients.map((p) =>
                p.id === params.id ? { ...p, isDisabled: !body.active } : p,
            );
            saveState("patients", patients);
            return new HttpResponse(null, { status: 204 });
        },
    ),

    http.put(`${BASE_URL}/admin/Patients/:id/unlock`, ({ params }) => {
        patients = patients.map((p) =>
            p.id === params.id ? { ...p, isDisabled: false } : p,
        );
        saveState("patients", patients);
        return new HttpResponse(null, { status: 204 });
    }),

    // --- BOOKINGS ---
    http.get(`${BASE_URL}/admin/bookings`, ({ request }) => {
        const url = new URL(request.url);
        const page = Number(url.searchParams.get("page") || 1);
        const pageSize = Number(url.searchParams.get("pageSize") || 10);
        const start = (page - 1) * pageSize;
        return HttpResponse.json({
            total: bookings.length,
            data: bookings.slice(start, start + pageSize),
        });
    }),
];
