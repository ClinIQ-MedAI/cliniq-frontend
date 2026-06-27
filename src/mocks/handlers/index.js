import { authHandlers } from "./auth";
import { doctorHandlers } from "./doctor";
import { scheduleHandlers } from "./schedules";
import { chatHandlers } from "./chat";
import { adminHandlers } from "./admin";

export const handlers = [
    ...authHandlers,
    ...doctorHandlers,
    ...scheduleHandlers,
    ...chatHandlers,
    ...adminHandlers,
];
