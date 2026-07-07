import { http, HttpResponse } from "msw";
import { BASE_URL } from "../config";
import { loadState, saveState } from "../storage";

const fakeAdmin = {
    id: "admin-001",
    email: "admin@clinic.com",
    password: "AdminPassword123!",
};

export let fakeDoctor = loadState("fakeDoctor", {
    id: "doctor-001",
    email: "doctor@cliniq.com",
    firstName: "Ahmed",
    lastName: "Hassan",
    password: "Password123!",
    emailVerified: false,
    doctorStatus: "INCOMPLETE_PROFILE",
});

let otpStore = loadState("otpStore", {});

export const authHandlers = [
    http.post(`${BASE_URL}/auth/register`, async ({ request }) => {
        const body = await request.json();
        fakeDoctor = {
            ...fakeDoctor,
            id: crypto.randomUUID(), // unique id per registration — avoids clobbering doctor-001
            email: body.email,
            firstName: body.firstName,
            lastName: body.lastName,
            password: body.password,
            emailVerified: false,
            doctorStatus: "INCOMPLETE_PROFILE",
        };
        saveState("fakeDoctor", fakeDoctor);
        return HttpResponse.json(
            { message: "Registration successful. Please verify your email." },
            { status: 201 },
        );
    }),

    http.post(`${BASE_URL}/auth/send-email-otp`, async ({ request }) => {
        const body = await request.json();
        otpStore[body.email] = "123456";
        saveState("otpStore", otpStore);
        console.log(`[MSW] OTP for ${body.email} is: 123456`);
        return HttpResponse.json({ message: "OTP sent to email." });
    }),

    http.post(`${BASE_URL}/auth/verify-email`, async ({ request }) => {
        const body = await request.json();
        if (body.code === "123456") {
            fakeDoctor.emailVerified = true;
            saveState("fakeDoctor", fakeDoctor);
            return HttpResponse.json({
                message: "Email verified successfully.",
            });
        }
        return HttpResponse.json(
            { message: "Invalid OTP code." },
            { status: 400 },
        );
    }),

    http.post(`${BASE_URL}/auth/login`, async ({ request }) => {
        const body = await request.json();

        if (
            body.email === fakeAdmin.email &&
            body.password === fakeAdmin.password
        ) {
            return HttpResponse.json({
                token: "fake-jwt-token-admin-001",
                refreshToken: "fake-refresh-token-admin-001",
                expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
                patientStatus: "INCOMPLETE_PROFILE",
                doctorStatus: "INCOMPLETE_PROFILE",
                role: "Admin",
            });
        }

        if (
            body.email === fakeDoctor.email &&
            body.password === fakeDoctor.password
        ) {
            return HttpResponse.json({
                token: "fake-jwt-token-doctor-001",
                refreshToken: "fake-refresh-token-001",
                expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
                patientStatus: "INCOMPLETE_PROFILE",
                doctorStatus: fakeDoctor.doctorStatus,
                role: "Doctor",
            });
        }

        return HttpResponse.json(
            { message: "Invalid email or password." },
            { status: 401 },
        );
    }),

    http.post(`${BASE_URL}/auth/forgot-password`, async ({ request }) => {
        const body = await request.json();
        otpStore[`reset_${body.email}`] = "654321";
        saveState("otpStore", otpStore);
        console.log(`[MSW] Reset OTP for ${body.email} is: 654321`);
        return HttpResponse.json({ message: "Reset code sent to email." });
    }),

    http.post(`${BASE_URL}/auth/reset-password`, async ({ request }) => {
        const body = await request.json();
        if (body.code === "654321") {
            fakeDoctor.password = body.newPassword;
            saveState("fakeDoctor", fakeDoctor);
            return HttpResponse.json({
                message: "Password reset successfully.",
            });
        }
        return HttpResponse.json(
            { message: "Invalid or expired reset code." },
            { status: 400 },
        );
    }),

    http.post(`${BASE_URL}/auth/send-login-otp`, async ({ request }) => {
        const body = await request.json();
        otpStore[`login_${body.email}`] = "111222";
        saveState("otpStore", otpStore);
        console.log(`[MSW] Login OTP for ${body.email} is: 111222`);
        return HttpResponse.json({ message: "OTP sent." });
    }),
];
