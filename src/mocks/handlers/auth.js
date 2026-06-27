import { http, HttpResponse } from "msw";
import { BASE_URL } from "../config";

const fakeAdmin = {
    id: "admin-001",
    email: "admin@cliniq.com",
    firstName: "System",
    lastName: "Admin",
    password: "AdminPassword123!",
    role: "Admin", // Use this in your React router to know where to send them
};
// Fake doctor stored in memory (simulates DB)
export let fakeDoctor = {
    id: "doctor-001",
    email: "doctor@cliniq.com",
    firstName: "Ahmed",
    lastName: "Hassan",
    password: "Password123!",
    emailVerified: false,
    doctorStatus: "INCOMPLETE_PROFILE", // INCOMPLETE_PROFILE | PENDING_VERIFICATION | REJECTED | ACTIVE | SUSPENDED
    role: "Doctor",
};

let otpStore = {};

export const authHandlers = [
    // POST /auth/register
    http.post(`${BASE_URL}/auth/register`, async ({ request }) => {
        const body = await request.json();
        fakeDoctor = {
            ...fakeDoctor,
            email: body.email,
            firstName: body.firstName,
            lastName: body.lastName,
            password: body.password,
            emailVerified: false,
            doctorStatus: "INCOMPLETE_PROFILE",
        };
        return HttpResponse.json(
            { message: "Registration successful. Please verify your email." },
            { status: 201 },
        );
    }),

    // POST /auth/send-email-otp
    http.post(`${BASE_URL}/auth/send-email-otp`, async ({ request }) => {
        const body = await request.json();
        otpStore[body.email] = "123456"; // fixed OTP for testing
        console.log(`[MSW] OTP for ${body.email} is: 123456`);
        return HttpResponse.json({ message: "OTP sent to email." });
    }),

    // POST /auth/verify-email
    http.post(`${BASE_URL}/auth/verify-email`, async ({ request }) => {
        const body = await request.json();
        if (body.otpCode === "123456") {
            fakeDoctor.emailVerified = true;
            return HttpResponse.json({
                message: "Email verified successfully.",
            });
        }
        return HttpResponse.json(
            { message: "Invalid OTP code." },
            { status: 400 },
        );
    }),

    // POST /auth/login
    http.post(`${BASE_URL}/auth/login`, async ({ request }) => {
        const body = await request.json();
        if (
            body.email === fakeAdmin.email &&
            body.password === fakeAdmin.password
        ) {
            debugger;
            console.log("[MSW] Admin logged in successfully");
            return HttpResponse.json({
                id: fakeAdmin.id,
                email: fakeAdmin.email,
                firstName: fakeAdmin.firstName,
                lastName: fakeAdmin.lastName,
                role: fakeAdmin.role, // <-- Frontend checks this to route to /admin
                token: "fake-jwt-token-admin-001",
                expiresIn: 3600,
                refreshToken: "fake-refresh-token-admin-001",
                refreshTokenExpiration: new Date(
                    Date.now() + 7 * 24 * 60 * 60 * 1000,
                ).toISOString(),
            });
        }

        // 3. Check if the credentials match the Doctor
        if (
            body.email === fakeDoctor.email &&
            body.password === fakeDoctor.password
        ) {
            console.log("[MSW] Doctor logged in successfully");
            debugger;

            return HttpResponse.json({
                id: fakeDoctor.id,
                email: fakeDoctor.email,
                firstName: fakeDoctor.firstName,
                lastName: fakeDoctor.lastName,
                role: "Doctor", // <-- Frontend checks this to route to /doctor
                token: "fake-jwt-token-doctor-001",
                expiresIn: 3600,
                refreshToken: "fake-refresh-token-001",
                refreshTokenExpiration: new Date(
                    Date.now() + 7 * 24 * 60 * 60 * 1000,
                ).toISOString(),
                doctorStatus: fakeDoctor.doctorStatus,
                patientStatus: "INCOMPLETE_PROFILE",
            });
        }

        // 4. Fallback for invalid credentials
        return HttpResponse.json(
            { message: "Invalid email or password." },
            { status: 401 },
        );
    }),

    // POST /auth/forgot-password
    http.post(`${BASE_URL}/auth/forgot-password`, async ({ request }) => {
        const body = await request.json();
        otpStore[`reset_${body.email}`] = "654321";
        console.log(`[MSW] Reset OTP for ${body.email} is: 654321`);
        return HttpResponse.json({ message: "Reset code sent to email." });
    }),

    // POST /auth/reset-password
    http.post(`${BASE_URL}/auth/reset-password`, async ({ request }) => {
        const body = await request.json();
        if (body.otpCode === "654321") {
            fakeDoctor.password = body.newPassword;
            return HttpResponse.json({
                message: "Password reset successfully.",
            });
        }
        return HttpResponse.json(
            { message: "Invalid or expired reset code." },
            { status: 400 },
        );
    }),

    // POST /auth/send-login-otp
    http.post(`${BASE_URL}/auth/send-login-otp`, async ({ request }) => {
        const body = await request.json();
        otpStore[`login_${body.email}`] = "111222";
        console.log(`[MSW] Login OTP for ${body.email} is: 111222`);
        return HttpResponse.json({ message: "OTP sent." });
    }),
    // POST /auth/refresh
    http.post(`${BASE_URL}/auth/refresh`, async ({ request }) => {
        return HttpResponse.json({
            token: "new-fake-jwt-token",
            expiresIn: 3600,
            refreshToken: "new-fake-refresh-token",
            refreshTokenExpiration: new Date(
                Date.now() + 7 * 24 * 60 * 60 * 1000,
            ).toISOString(),
        });
    }),
    http.post(`${BASE_URL}/auth/resend-email-otp`, async ({ request }) => {
        return HttpResponse.json({ message: "New OTP sent." });
    }),
];
