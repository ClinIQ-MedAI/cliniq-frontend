import { http, HttpResponse } from "msw";
import { BASE_URL } from "../config";
import { loadState, saveState } from "../storage";

let conversations = loadState("conversations", [
    {
        id: 1,
        doctorId: "doctor-001",
        doctorName: "Ahmed Hassan",
        patientId: "patient-001",
        patientName: "Sara Mohamed",
        lastMessageAt: new Date(Date.now() - 5 * 60000).toISOString(),
        messageCount: 3,
    },
    {
        id: 2,
        doctorId: "doctor-001",
        doctorName: "Ahmed Hassan",
        patientId: "patient-002",
        patientName: "Omar Khaled",
        lastMessageAt: new Date(Date.now() - 60 * 60000).toISOString(),
        messageCount: 2,
    },
    {
        id: 3,
        doctorId: "doctor-001",
        doctorName: "Ahmed Hassan",
        patientId: "patient-003",
        patientName: "Nour Ahmed",
        lastMessageAt: new Date(Date.now() - 24 * 60 * 60000).toISOString(),
        messageCount: 0,
    },
]);

let messages = loadState("messages", {
    1: [
        {
            id: 1,
            senderId: "patient-001",
            senderName: "Sara Mohamed",
            senderType: "PATIENT",
            content:
                "Good morning doctor, I have been having chest pain since yesterday.",
            status: "READ",
            createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
            readAt: new Date(Date.now() - 25 * 60000).toISOString(),
        },
        {
            id: 2,
            senderId: "doctor-001",
            senderName: "Ahmed Hassan",
            senderType: "DOCTOR",
            content: "Good morning Sara. Is the pain sharp or dull?",
            status: "DELIVERED",
            createdAt: new Date(Date.now() - 20 * 60000).toISOString(),
            readAt: null,
        },
        {
            id: 3,
            senderId: "patient-001",
            senderName: "Sara Mohamed",
            senderType: "PATIENT",
            content: "It is a dull pain and yes it gets worse when I breathe.",
            status: "SENT",
            createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
            readAt: null,
        },
    ],
    2: [
        {
            id: 4,
            senderId: "patient-002",
            senderName: "Omar Khaled",
            senderType: "PATIENT",
            content: "Doctor, my follow-up results are ready.",
            status: "READ",
            createdAt: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
            readAt: new Date(Date.now() - 90 * 60000).toISOString(),
        },
        {
            id: 5,
            senderId: "doctor-001",
            senderName: "Ahmed Hassan",
            senderType: "DOCTOR",
            content: "Great news Omar! Keep up the medication.",
            status: "READ",
            createdAt: new Date(Date.now() - 60 * 60000).toISOString(),
            readAt: new Date(Date.now() - 55 * 60000).toISOString(),
        },
    ],
    3: [],
});

let messageIdCounter = loadState("messageIdCounter", 100);

export const chatHandlers = [
    http.get(`${BASE_URL}/chat/conversations`, () =>
        HttpResponse.json(conversations),
    ),

    http.get(
        `${BASE_URL}/chat/conversations/:conversationId/messages`,
        ({ params }) => {
            const id = Number(params.conversationId);
            return HttpResponse.json(messages[id] ?? []);
        },
    ),

    http.post(
        `${BASE_URL}/chat/conversations/:conversationId/messages`,
        async ({ request, params }) => {
            const id = Number(params.conversationId);
            const body = await request.json();
            const newMessage = {
                id: messageIdCounter++,
                senderId: "doctor-001",
                senderName: "Ahmed Hassan",
                senderType: "DOCTOR",
                content: body.content,
                status: "SENT",
                createdAt: new Date().toISOString(),
                readAt: null,
            };
            if (!messages[id]) messages[id] = [];
            messages[id].push(newMessage);
            saveState("messages", messages);
            saveState("messageIdCounter", messageIdCounter);

            const conv = conversations.find((c) => c.id === id);
            if (conv) {
                conv.lastMessageAt = newMessage.createdAt;
                conv.messageCount += 1;
                saveState("conversations", conversations);
            }

            return HttpResponse.json(newMessage);
        },
    ),
];
