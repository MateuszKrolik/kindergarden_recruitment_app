"use server";

import {
  PropertyParentDocument,
  RequestStatus,
} from "@/data-access-layer/modules/compliance/model";
import { ComplianceSvc } from "@/data-access-layer/modules/compliance/svc";
import { unstable_cacheTag as cacheTag, revalidateTag } from "next/cache";
import {
  getAllDocumentApprovalRequestsForGivenPropertyParentCacheTag,
  getPropertyParentDocumentApprovalRequestCacheTag,
  getAllDocumentApprovalRequestsForGivenPropertyCacheTag,
} from "./cacheTag";
import { PagedResponse } from "@/types/pagination";

const svc = new ComplianceSvc();

export async function getAllDocumentApprovalRequestsForGivenPropertyParent(
  propertyId: string,
  userId: string,
): Promise<{ data?: PropertyParentDocument[]; error?: Error }> {
  "use cache";
  cacheTag(
    getAllDocumentApprovalRequestsForGivenPropertyParentCacheTag(
      propertyId,
      userId,
    ),
  );
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
  "use cache";
  cacheTag(
    getPropertyParentDocumentApprovalRequestCacheTag(
      propertyId,
      userId,
      parentDocId,
    ),
  );
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
  "use cache";
  cacheTag(
    getPropertyParentDocumentApprovalRequestCacheTag(
      propertyId,
      userId,
      parentDocumentId,
    ),
  );
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
  "use cache";
  cacheTag(getAllDocumentApprovalRequestsForGivenPropertyCacheTag(propertyId));
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
): Promise<{ data?: PropertyParentDocument; error?: Error }> {
  "use cache";
  cacheTag(
    getPropertyParentDocumentApprovalRequestCacheTag(
      propertyId,
      userId,
      parentDocumentId,
    ),
  );
  return await svc.setPropertyParentDocumentRequestStatus(
    propertyId,
    userId,
    parentDocumentId,
    requestStatus,
  );
}

export async function revalidateGetAllDocumentApprovalRequestsForGivenPropertyCacheTag(
  propertyId: string,
): Promise<void> {
  revalidateTag(
    getAllDocumentApprovalRequestsForGivenPropertyCacheTag(propertyId),
  );
}

export async function revalidateGetAllDocumentApprovalRequestsForGivenPropertyParentCacheTag(
  propertyId: string,
  userId: string,
): Promise<void> {
  revalidateTag(
    getAllDocumentApprovalRequestsForGivenPropertyParentCacheTag(
      propertyId,
      userId,
    ),
  );
}

export async function revalidateGetPropertyParentDocumentApprovalRequestCacheTag(
  propertyId: string,
  userId: string,
  parentDocumentId: string,
): Promise<void> {
  revalidateTag(
    getPropertyParentDocumentApprovalRequestCacheTag(
      propertyId,
      userId,
      parentDocumentId,
    ),
  );
}
