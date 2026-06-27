import { http, HttpResponse } from "msw";
import { BASE_URL } from "../config";

const conversations = [
    {
        id: 1,
        patientId: "patient-001",
        patientName: "Sara Mohamed",
        lastMessageAt: new Date(Date.now() - 5 * 60000).toISOString(),
        unreadCount: 2,
    },
    {
        id: 2,
        patientId: "patient-002",
        patientName: "Omar Khaled",
        lastMessageAt: new Date(Date.now() - 60 * 60000).toISOString(),
        unreadCount: 0,
    },
    {
        id: 3,
        patientId: "patient-003",
        patientName: "Nour Ahmed",
        lastMessageAt: new Date(Date.now() - 24 * 60 * 60000).toISOString(),
        unreadCount: 0,
    },
];

const messages = {
    1: [
        {
            id: 1,
            senderId: "patient-001",
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
            senderType: "DOCTOR",
            content:
                "Good morning Sara. Is the pain sharp or dull? Does it get worse when you breathe deeply?",
            status: "DELIVERED",
            createdAt: new Date(Date.now() - 20 * 60000).toISOString(),
            readAt: null,
        },
        {
            id: 3,
            senderId: "patient-001",
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
            senderType: "PATIENT",
            content:
                "Doctor, my follow-up results are ready. Everything looks normal.",
            status: "READ",
            createdAt: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
            readAt: new Date(Date.now() - 90 * 60000).toISOString(),
        },
        {
            id: 5,
            senderId: "doctor-001",
            senderType: "DOCTOR",
            content:
                "Great news Omar! Keep up the medication and schedule a visit next month.",
            status: "READ",
            createdAt: new Date(Date.now() - 60 * 60000).toISOString(),
            readAt: new Date(Date.now() - 55 * 60000).toISOString(),
        },
    ],
    3: [],
};

let messageIdCounter = 100;

export const chatHandlers = [
    // GET /chat/conversations  (doctor view)
    http.get(`${BASE_URL}/chat/conversations`, () => {
        return HttpResponse.json(conversations);
    }),

    // GET /chat/conversations/:id/messages
    http.get(
        `${BASE_URL}/chat/conversations/:conversationId/messages`,
        ({ params }) => {
            const id = Number(params.conversationId);
            return HttpResponse.json(messages[id] ?? []);
        },
    ),

    // POST /chat/conversations/:id/messages
    http.post(
        `${BASE_URL}/chat/conversations/:conversationId/messages`,
        async ({ request, params }) => {
            const id = Number(params.conversationId);
            const body = await request.json();
            const newMessage = {
                id: messageIdCounter++,
                senderId: "doctor-001",
                senderType: "DOCTOR",
                content: body.content,
                status: "SENT",
                createdAt: new Date().toISOString(),
                readAt: null,
            };
            if (!messages[id]) messages[id] = [];
            messages[id].push(newMessage);

            // Update conversation lastMessageAt
            const conv = conversations.find((c) => c.id === id);
            if (conv) conv.lastMessageAt = newMessage.createdAt;

            return HttpResponse.json(newMessage, { status: 201 });
        },
    ),
];
