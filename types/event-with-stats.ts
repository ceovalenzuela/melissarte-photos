import { Event } from "./event";

export type EventWithStats = Event & {
  photoCount: number;
};