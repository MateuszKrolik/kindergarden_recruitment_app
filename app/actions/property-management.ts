"use server";

import { unstable_cacheTag as cacheTag } from "next/cache";
import { PropertyManagementSvc } from "@/data-access-layer/modules/property-management/svc";
import { PagedResponse } from "@/types/pagination";
import {
  Property,
  PropertyUser,
} from "@/data-access-layer/modules/property-management/model";

const svc = new PropertyManagementSvc();

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
  return svc.getPropertyUser(propertyId, userId);
}
