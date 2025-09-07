"use server";

import { unstable_cacheTag as cacheTag } from "next/cache";
import { PropertyManagementSvc } from "@/data-access-layer/modules/property-management/svc";
import { PagedResponse } from "@/types/pagination";
import {
  Property,
  PropertyParentDocumentRequirement,
  PropertyUser,
} from "@/data-access-layer/modules/property-management/model";
import { IdentitySvc } from "@/data-access-layer/modules/identity/svc";

const client = new IdentitySvc();
const svc = new PropertyManagementSvc(client);

export async function getAllProperties(
  pageSize: number,
  pageNumber: number,
): Promise<PagedResponse<Property> | Error> {
  "use cache";
  cacheTag("properties");
  return await svc.getAllProperties(pageSize, pageNumber);
}

export async function getPropertyUser(
  propertyId: string,
  userId: string,
): Promise<PropertyUser | Error> {
  "use cache";
  cacheTag(`properties:${propertyId}:users:${userId}`);
  return await svc.getPropertyUser(propertyId, userId);
}

export async function getPropertyParentDocumentRequirements(
  propertyId: string,
  userId: string,
): Promise<PropertyParentDocumentRequirement[] | Error> {
  "use cache";
  cacheTag(`properties:${propertyId}:parents:${userId}:requirements`);
  return await svc.getDocumentRequirementsForGivenPropertyParent(
    propertyId,
    userId,
  );
}
