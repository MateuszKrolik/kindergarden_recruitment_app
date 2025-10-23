"use server";

import { PagedResponse } from "shared/types/pagination";
import {
  PropertyChild,
  PropertyChildDocumentRequirement,
} from "shared/types/modules/property-management";
import type { ApiResponse } from "shared/types/response";
import {
  ApiResponseListPropertyParentDocumentRequirement,
  ApiResponsePagedResponseProperty,
} from "@/api-client";
import { getPropertyApi } from "@/lib/api-client/property";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

export async function getAllProperties(
  jwt: string,
  pageSize: number,
  pageNumber: number,
): Promise<ApiResponsePagedResponseProperty> {
  const api = getPropertyApi(jwt);
  return await api.getPropertiesPropertiesGet({
    pageSize: pageSize,
    pageNumber: pageNumber,
  });
}

export async function getPropertyParentDocumentRequirements(
  jwt: string,
  propertyId: string,
  userId: string,
): Promise<ApiResponseListPropertyParentDocumentRequirement> {
  const api = getPropertyApi(jwt);
  return await api.getDocumentRequirementsForGivenPropertyParentPropertiesPropertyIdUsersUserIdParentDocumentRequirementsGet(
    {
      propertyId: propertyId,
      userId: userId,
    },
  );
}

export async function getAllPropertyChildrenForGivenParent(
  jwt: string,
  propertyId: string,
  parentId: string,
): ApiResponse<PropertyChild[]> {
  const response = await fetch(
    `${BACKEND_URL}/properties/${propertyId}/parents/${parentId}/property-children`,
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      method: "GET",
    },
  );
  return await response.json();
}

export async function getDocumentRequirementsForGivenPropertyChild(
  jwt: string,
  propertyId: string,
  childId: string,
): ApiResponse<PropertyChildDocumentRequirement[]> {
  const response = await fetch(
    `${BACKEND_URL}/properties/${propertyId}/children/${childId}/document-requirements`,
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      method: "GET",
    },
  );
  return await response.json();
}

export async function getAllPropertyChildrenPaged(
  jwt: string,
  propertyId: string,
  pageSize: number,
  pageNumber: number,
): ApiResponse<PagedResponse<PropertyChild>> {
  const response = await fetch(
    `${BACKEND_URL}/properties/${propertyId}/property-children?pageSize=${pageSize}&pageNumber=${pageNumber}`,
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      method: "GET",
    },
  );
  return await response.json();
}
