import { Event } from "./event";

export type EventWithStats = Event & {
  photoCount: number;
  messageCount: number;
  lastActivityAt: string | null;
};
