const API_ENDPOINTS = {
    signup: "/auth/register",
    login: "/auth/login",
    getOrUpdateMe: "/doctor/me",
    changePassword: "/doctor/me/change-password",
    survey: "/doctor/survey",
    getPendingAppointments: "/doctor/appointments/pending",
    updateAppointmentStatus: (appointmentId) =>
        `doctor/appointments/${appointmentId}/status`,
    getDashboardMetrices: "doctor/metrics",
    getAllAppointments: "/doctor/appointments",
    getOrCreateDoctor: "/admin/doctors",
    getOrUpdateDoctor: (doctorId) => `/admin/doctors/${doctorId}`,
    updateDoctorStatus: (doctorId) => `/admin/doctors/${doctorId}/status`,
    unlockDoctor: (doctorId) => `/admin/doctors/${doctorId}/unlock`,
    approveDoctor: (doctorId) => `/admin/doctors/${doctorId}/approve`,
    rejectDoctor: (doctorId) => `/admin/doctors/${doctorId}/reject`,
    getOrCreatePatients: "/admin/patients",
    getOrUpdatePatient: (patientId) => `/admin/patients/${patientId}`,
    updatePatientStatus: (patientId) => `/admin/patients/${patientId}/status`,
    unlockPatient: (patientId) => `/admin/patients/${patientId}/unlock`,
    getAllBookings: "/admin/bookings",
};

export default API_ENDPOINTS;
