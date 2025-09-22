export const REQUEST_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export type RequestStatus =
  (typeof REQUEST_STATUS)[keyof typeof REQUEST_STATUS];

export type PropertyParentDocument = {
  property_id: string;
  user_id: string;
  parent_document_id: string;
  request_status: RequestStatus;
  approved_by?: string;
};
