/**
 * @file JSDoc type definitions for ClinIQ API responses.
 * These are documentation-only — they don't run any code, but VS Code (and
 * any editor with the TypeScript language server, which ships with VS Code
 * by default) reads them to give you autocomplete + type-checking on plain
 * .js files, without adding TypeScript as a build step.
 *
 * See bottom of file for usage instructions.
 */

// ---------- Enums ----------

/** @typedef {"INCOMPLETE_PROFILE"|"PENDING_VERIFICATION"|"REJECTED"|"ACTIVE"|"SUSPENDED"} DoctorStatus */
/** @typedef {"INCOMPLETE_PROFILE"|"ACTIVE"|"SUSPENDED"} PatientStatus */
/** @typedef {"PENDING"|"CONFIRMED"|"CANCELLED"|"COMPLETED"} BookingStatus */
/** @typedef {"SENT"|"DELIVERED"|"READ"} MessageStatus */
/** @typedef {"DOCTOR"|"PATIENT"} MessageSenderType */

// ---------- Auth ----------

/**
 * @typedef {Object} LoginResponse
 * @property {string} token
 * @property {string} refreshToken
 * @property {string} expiresAt - ISO date string
 * @property {PatientStatus} patientStatus
 * @property {DoctorStatus} doctorStatus
 */

/**
 * @typedef {Object} MessageResponse
 * @property {string} message
 */

// ---------- Doctor ----------

/**
 * @typedef {Object} DoctorProfileResponse - shape of GET /doctor/me
 * @property {string} email
 * @property {string} firstName
 * @property {string} lastName
 */

/**
 * @typedef {Object} DoctorResponse - shape of admin doctor list/detail
 * @property {string} id
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 * @property {boolean} isDisabled
 * @property {DoctorStatus} status
 */

// ---------- Patient ----------

/**
 * @typedef {Object} PatientResponse - shape of admin patient list/detail
 * @property {string} id
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 * @property {boolean} isDisabled
 * @property {PatientStatus} status
 */

// ---------- Schedules ----------

/**
 * @typedef {Object} DoctorSchedule - raw entity returned by GET /schedules
 * @property {number} id
 * @property {string} doctorId
 * @property {string} date - ISO date string (YYYY-MM-DD)
 * @property {number} bookingCount
 * @property {boolean} isAvailable
 */

// ---------- Bookings (admin) ----------

/**
 * @typedef {Object} BookingSummary
 * @property {number} id
 * @property {string} date - ISO date string
 * @property {string} patientName
 * @property {string} doctorName
 * @property {BookingStatus} status
 */

/**
 * @typedef {Object} PaginatedBookings - shape of GET /admin/bookings
 * @property {number} total
 * @property {BookingSummary[]} data
 */

// ---------- Chat ----------

/**
 * @typedef {Object} ConversationResponse
 * @property {number} id
 * @property {string} doctorId
 * @property {string} doctorName
 * @property {string} patientId
 * @property {string} patientName
 * @property {string|null} lastMessageAt
 * @property {number} messageCount
 */

/**
 * @typedef {Object} ChatMessageResponse
 * @property {number} id
 * @property {string} senderId
 * @property {string} senderName
 * @property {MessageSenderType} senderType
 * @property {string} content
 * @property {MessageStatus} status
 * @property {string} createdAt
 * @property {string|null} readAt
 */

// ---------- Errors ----------

/**
 * @typedef {Object} ApiErrorDetail
 * @property {string} code
 * @property {string} description
 */

/**
 * @typedef {Object} ApiErrorResponse
 * @property {string} [type]
 * @property {number} status
 * @property {string} title
 * @property {ApiErrorDetail[]} errors
 */

export {};
