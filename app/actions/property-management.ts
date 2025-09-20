"use server";

import svc from "@/data-access-layer/modules/property-management/svc";
import { PagedResponse } from "@/types/pagination";
import {
  Property,
  PropertyChild,
  PropertyParentDocumentRequirement,
  PropertyChildDocumentRequirement,
  PropertyUser,
} from "@/data-access-layer/modules/property-management/model";

export async function getAllProperties(
  pageSize: number,
  pageNumber: number,
): Promise<{ data?: PagedResponse<Property>; error?: Error }> {
  return await svc.getAllProperties(pageSize, pageNumber);
}

export async function getPropertyUser(
  propertyId: string,
  userId: string,
): Promise<{ data?: PropertyUser; error?: Error }> {
  return await svc.getPropertyUser(propertyId, userId);
}

export async function getPropertyParentDocumentRequirements(
  propertyId: string,
  userId: string,
): Promise<{ data?: PropertyParentDocumentRequirement[]; error?: Error }> {
  return await svc.getDocumentRequirementsForGivenPropertyParent(
    propertyId,
    userId,
  );
}

export async function getAllPropertyChildrenForGivenParent(
  propertyId: string,
  parentId: string,
): Promise<{
  data?: PropertyChild[];
  error?: Error;
}> {
  return await svc.getAllPropertyChildrenForGivenParent(propertyId, parentId);
}

export async function getDocumentRequirementsForGivenPropertyChild(
  propertyId: string,
  childId: string,
): Promise<{ data?: PropertyChildDocumentRequirement[]; error?: Error }> {
  return await svc.getDocumentRequirementsForGivenPropertyChild(
    propertyId,
    childId,
  );
}
