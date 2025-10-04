export const REQUEST_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const satisfies Record<string, RequestStatus>;

export type RequestStatus = "pending" | "approved" | "rejected";

export type PropertyParentDocument = {
  property_id: string;
  user_id: string;
  parent_document_id: string;
  request_status: RequestStatus;
  approved_by?: string;
};

export type PropertyChildDocument = {
  property_id: string;
  child_id: string;
  child_document_id: string;
  request_status: RequestStatus;
  approved_by?: string;
};
