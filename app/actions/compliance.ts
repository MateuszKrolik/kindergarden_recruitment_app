"use server";

import {
  PropertyParentDocument,
  RequestStatus,
} from "@/data-access-layer/modules/compliance/model";
import svc from "@/data-access-layer/modules/compliance/svc";
import { PagedResponse } from "@/types/pagination";

export async function getAllDocumentApprovalRequestsForGivenPropertyParent(
  propertyId: string,
  userId: string,
): Promise<{ data?: PropertyParentDocument[]; error?: Error }> {
  return await svc.getAllDocumentApprovalRequestsForGivenPropertyParent(
    propertyId,
    userId,
  );
}

export async function getPropertyParentDocumentApprovalRequestByDocumentId(
  propertyId: string,
  userId: string,
  parentDocId: string,
): Promise<{ data?: PropertyParentDocument; error?: Error }> {
  return await svc.getPropertyParentDocumentApprovalRequestByDocumentId(
    propertyId,
    userId,
    parentDocId,
  );
}

export async function sendPropertyParentDocumentApprovalRequest(
  propertyId: string,
  userId: string,
  parentDocumentId: string,
): Promise<{ data?: PropertyParentDocument; error?: Error }> {
  return await svc.sendPropertyParentDocumentApprovalRequest(
    propertyId,
    userId,
    parentDocumentId,
  );
}

export async function getAllDocumentApprovalRequestsForGivenProperty(
  propertyId: string,
  pageSize: number,
  pageNumber: number,
): Promise<{ data?: PagedResponse<PropertyParentDocument>; error?: Error }> {
  return await svc.getAllDocumentApprovalRequestsForGivenProperty(
    propertyId,
    pageSize,
    pageNumber,
  );
}

export async function setPropertyParentDocumentApprovalRequestStatus(
  propertyId: string,
  userId: string,
  parentDocumentId: string,
  requestStatus: RequestStatus,
  adminId: string,
): Promise<{ data?: PropertyParentDocument; error?: Error }> {
  return await svc.setPropertyParentDocumentRequestStatus(
    propertyId,
    userId,
    parentDocumentId,
    requestStatus,
    adminId,
  );
}
