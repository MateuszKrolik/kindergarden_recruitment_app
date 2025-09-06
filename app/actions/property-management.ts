"use server";

import { unstable_cacheTag as cacheTag } from "next/cache";
import { PropertyManagementSvc } from "@/data-access-layer/modules/property-management/svc";
import { PagedResponse } from "@/types/pagination";
import { Property } from "@/data-access-layer/modules/property-management/model";

const svc = new PropertyManagementSvc();

export async function getAllProperties(
  pageSize: number,
  pageNumber: number,
): Promise<PagedResponse<Property> | Error> {
  "use cache";
  cacheTag("properties");
  return await svc.getAllProperties(pageSize, pageNumber);
}
