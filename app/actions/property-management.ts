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
import type { AsyncResponseType } from "@/data-access-layer/shared/types/response";

export async function getAllProperties(
  pageSize: number,
  pageNumber: number,
): AsyncResponseType<PagedResponse<Property>> {
  return await svc.getAllProperties(pageSize, pageNumber);
}

export async function getPropertyUser(
  propertyId: string,
  userId: string,
): AsyncResponseType<PropertyUser> {
  return await svc.getPropertyUser(propertyId, userId);
}

export async function getPropertyParentDocumentRequirements(
  propertyId: string,
  userId: string,
): AsyncResponseType<PropertyParentDocumentRequirement[]> {
  return await svc.getDocumentRequirementsForGivenPropertyParent(
    propertyId,
    userId,
  );
}

export async function getAllPropertyChildrenForGivenParent(
  propertyId: string,
  parentId: string,
): AsyncResponseType<PropertyChild[]> {
  return await svc.getAllPropertyChildrenForGivenParent(propertyId, parentId);
}

export async function getDocumentRequirementsForGivenPropertyChild(
  propertyId: string,
  childId: string,
): AsyncResponseType<PropertyChildDocumentRequirement[]> {
  return await svc.getDocumentRequirementsForGivenPropertyChild(
    propertyId,
    childId,
  );
}
