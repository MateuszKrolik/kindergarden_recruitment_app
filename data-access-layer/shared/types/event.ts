import { v4 as uuidv4 } from "uuid";

export type EventEnvelope<T> = {
  id: string;
  type: string;
  timestamp: Date;
  payload: T;
  source: string;
  version: string;
};

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
