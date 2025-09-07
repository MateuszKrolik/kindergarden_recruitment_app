export enum RequestStatus {
  PendingStatus = "pending",
  ApprovedStatus = "approved",
  RejectedStatus = "rejected",
}

export type PropertyParentDocument = {
  property_id: string;
  user_id: string;
  parent_document_id: string;
  status: RequestStatus;
  approved_by?: string;
};
