// src/services/mockData.js

export const patientsData = [
  {
    id: 1,
    name: "Ahmed Ali",
    age: 45,
    gender: "Male",
    contact: "+1 234 567 8900",
    email: "ahmed.ali@example.com",
    lastVisit: "2024-01-22",
    nextAppointment: "2024-02-10",
    status: "treated",
    condition: "Stable",
    department: "Cardiology",
    doctor: "Dr. Robert",
    visits: 12,
    bloodType: "O+",
    allergies: ["Penicillin", "Peanuts"],
    medications: ["Metoprolol", "Aspirin"],
    notes: "Regular check-up completed"
  },
  {
    id: 2,
    name: "Sarah Johnson",
    age: 32,
    gender: "Female",
    contact: "+1 987 654 3210",
    email: "sarah.j@example.com",
    lastVisit: "2024-02-27",
    nextAppointment: "2024-03-15",
    status: "in-treatment",
    condition: "Improving",
    department: "Neurology",
    doctor: "Dr. Smith",
    visits: 8,
    bloodType: "A+",
    allergies: ["None"],
    medications: ["Gabapentin", "Vitamin D"],
    notes: "Follow-up required"
  }
];

export const appointmentsData = [
  {
    id: 1,
    patientId: 1,
    patientName: "Ahmed Ali",
    date: "2024-01-22",
    time: "10:00 AM",
    type: "Follow-up",
    status: "approved",
    reason: "Routine check-up",
    duration: "30 mins",
    room: "Room 101"
  },
  {
    id: 2,
    patientId: 2,
    patientName: "Sarah Johnson",
    date: "2024-02-27",
    time: "2:30 PM",
    type: "Consultation",
    status: "pending",
    reason: "Headache evaluation",
    duration: "45 mins",
    room: "Room 205"
  }
];

export const announcementsData = [
  {
    id: 1,
    title: "Important Meeting",
    content: "Meeting has been scheduled for this Friday at 2 PM in Conference Room A.",
    date: "2024-01-15",
    priority: "high",
    author: "Admin"
  },
  {
    id: 2,
    title: "Website Update",
    content: "We request our efforts to take our websites to the next level.",
    date: "2024-01-14",
    priority: "medium",
    author: "IT Department"
  }
];

export const statsData = {
  totalPatients: 1248,
  todayAppointments: 18,
  revenue: 24580,
  satisfactionRate: 94,
  activeDoctors: 24,
  availableBeds: 56
};