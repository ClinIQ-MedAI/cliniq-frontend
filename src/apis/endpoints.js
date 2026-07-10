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
        getDoctorScheduleBookings: `/doctor/schedules/bookings`,
        determineDoctorAvailability: "/doctor/schedules/availability",
        generateSchedule: "/doctor/schedules/generate",
        getAllSchedules: "/doctor/schedules",
        getPerformanceData: `/doctor/performance`,
        Scans: {
            review: (scanId) => `/Scans/${scanId}/review`,
            getByPatient: (patientId) => `/Scans/patient/${patientId}`,
        },
        Prescriptions: {
            confirm: (prescriptionId) =>
                `/Prescriptions/${prescriptionId}/confirm`,
            getByPatient: (patientId) => `/Prescriptions/patient/${patientId}`,
        },
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
        Contact: {
            getAllMessages: "/admin/contact-us",
            markAsRead: (messageId) => `/admin/contact-us/${messageId}/read`,
        },
    },
    Bookings: {
        getMyBookings: "/bookings/me",
    },
    Chat: {
        getConversations: "/doctor/chat/conversations",
        getMessages: (conversationId) =>
            `/doctor/chat/conversations/${conversationId}/messages`,
        sendMessage: (conversationId) =>
            `/doctor/chat/conversations/${conversationId}/messages`,
    },
    Schedules: {
        getScheduleBookings: "/schedules/bookings",
        editBookingStatusInSchedule: (scheduleId) =>
            `/doctor/schedules/bookings/${scheduleId}/status`,
    },
    // getPendingAppointments: "/doctor/appointments/pending",
    // updateAppointmentStatus: (appointmentId) =>
    //     `doctor/appointments/${appointmentId}/status`,
    getDashboardMetrices: "doctor/metrics",
    // getAllAppointments: "/doctor/appointments",
    Notifications: {
        getAll: `/notifications`,
    },
};

export default API_ENDPOINTS;
