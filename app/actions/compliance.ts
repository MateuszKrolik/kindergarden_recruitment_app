"use server";

import { PropertyParentDocument } from "@/data-access-layer/modules/compliance/model";
import { ComplianceSvc } from "@/data-access-layer/modules/compliance/svc";
import { unstable_cacheTag as cacheTag, revalidateTag } from "next/cache";
import {
  getAllPropertyParentDocumentApprovalRequestsCacheTag,
  getPropertyParentDocumentApprovalRequestCacheTag,
} from "./cacheTag";

const svc = new ComplianceSvc();

export async function getPropertyParentDocumentApprovalRequests(
  propertyId: string,
  userId: string,
): Promise<PropertyParentDocument[] | Error> {
  "use cache";
  cacheTag(
    getAllPropertyParentDocumentApprovalRequestsCacheTag(propertyId, userId),
  );
  return await svc.getPropertyParentDocumentApprovalRequests(
    propertyId,
    userId,
  );
}

export async function getPropertyParentDocumentApprovalRequestByDocumentId(
  propertyId: string,
  userId: string,
  parentDocId: string,
): Promise<PropertyParentDocument | Error> {
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
): Promise<PropertyParentDocument | Error> {
  "use cache";
  cacheTag(
    getPropertyParentDocumentApprovalRequestCacheTag(
      propertyId,
      userId,
      parentDocumentId,
    ),
  );
  return svc.sendPropertyParentDocumentApprovalRequest(
    propertyId,
    userId,
    parentDocumentId,
  );
}

export async function revalidateGetAllPropertyParentDocumentApprovalRequestsCacheTag(
  propertyId: string,
  userId: string,
): Promise<void> {
  revalidateTag(
    getAllPropertyParentDocumentApprovalRequestsCacheTag(propertyId, userId),
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
