export type EventEnvelope<T> = {
  id: string;
  type: string;
  timestamp: Date;
  payload: T;
  source: string;
  version: string;
};
