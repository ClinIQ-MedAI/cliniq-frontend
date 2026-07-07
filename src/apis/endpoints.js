const API_ENDPOINTS = {
    Auth: {
        signup: "/auth/register",
        login: "/auth/login",
        verifyEmail: "/auth/verify-email",
        verifyPhone: "/auth/verify-phone",
        sendEmailOtp: "/auth/send-email-otp",
        sendPhoneOtp: "/auth/send-phone-otp",
        forgotPassword: "/auth/forgot-password",
        resetPassword: "/auth/reset-password",
        sendLoginOtp: "/auth/send-login-otp",
    },
    Doctor: {
        getOrUpdateMe: "/doctor/me",
        changePassword: "/doctor/me/change-password",
        survey: "/doctor/Survey",
    },
    Admin: {
        Booking: { getAllBookings: "/admin/bookings" },
        Doctor: {
            getListOfDoctorsOrCreateDoctor: "/admin/Doctors",
            updateDoctorStatus: (doctorId) =>
                `/admin/Doctors/${doctorId}/status`,
            unlockDoctor: (doctorId) => `/admin/Doctors/${doctorId}/unlock`,
            approveDoctor: (doctorId) => `/admin/Doctors/${doctorId}/approve`,
            rejectDoctor: (doctorId) => `/admin/Doctors/${doctorId}/reject`,
            getOrUpdateOneDoctor: (doctorId) => `/admin/Doctors/${doctorId}`,
        },
        Patient: {
            getOrCreatePatients: "/admin/Patients",

            /**
             *
             * @param {string} patientId
             * @returns {string}
             */
            getOrUpdatePatient: (patientId) => `/admin/Patients/${patientId}`,
            /**
             *
             * @param {string} patientId
             * @returns {string}
             */
            updatePatientStatus: (patientId) =>
                `/admin/Patients/${patientId}/status`,
            /**
             *
             * @param {string} patientId
             * @returns {string}
             */
            unlockPatient: (patientId) => `/admin/Patients/${patientId}/unlock`,
        },
    },
    Chat: {
        // GET only — doctors can't create a conversation, only the patient can start one
        getConversations: "/chat/conversations",
        getOrSendMessages: (conversationId) =>
            `/chat/conversations/${conversationId}/messages`,
    },
    Schedules: {
        getAllSchedules: "/schedules",
        determineDoctorAvailability: "/schedules/availability",
        generateSchedule: "/schedules/generate",
    },
    // getPendingAppointments: "/doctor/appointments/pending",
    // updateAppointmentStatus: (appointmentId) =>
    //     `doctor/appointments/${appointmentId}/status`,
    getDashboardMetrices: "doctor/metrics",
    // getAllAppointments: "/doctor/appointments",
};

export default API_ENDPOINTS;
