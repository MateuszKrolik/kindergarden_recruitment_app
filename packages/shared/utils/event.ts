import { v4 as uuidv4 } from "uuid";
import type { EventEnvelope } from "../types/event";

export function createEvent<T>(
  type: string,
  source: string,
  version: string,
  payload: T,
): EventEnvelope<T> {
  return {
    id: uuidv4(),
    type: type,
    timestamp: new Date(),
    payload: payload,
    source: source,
    version: version,
  };
}
