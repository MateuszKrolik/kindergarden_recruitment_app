"use server";

import { PropertyParentDocument } from "@/data-access-layer/modules/compliance/model";
import { ComplianceSvc } from "@/data-access-layer/modules/compliance/svc";
import { unstable_cacheTag as cacheTag } from "next/cache";
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
