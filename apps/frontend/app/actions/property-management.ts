"use server";

import { PagedResponse } from "shared/types/pagination";
import {
  Property,
  PropertyChild,
  PropertyParentDocumentRequirement,
  PropertyChildDocumentRequirement,
} from "shared/types/modules/property-management";
import type { ApiResponse } from "shared/types/response";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

export async function getAllProperties(
  jwt: string,
  pageSize: number,
  pageNumber: number,
): ApiResponse<PagedResponse<Property>> {
  const response = await fetch(
    `${BACKEND_URL}/properties?page_size=${pageSize}&page_number=${pageNumber}`,
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      method: "GET",
    },
  );
  return await response.json();
}

export async function getPropertyParentDocumentRequirements(
  jwt: string,
  propertyId: string,
  userId: string,
): ApiResponse<PropertyParentDocumentRequirement[]> {
  const response = await fetch(
    `${BACKEND_URL}/properties/${propertyId}/users/${userId}/parent-document-requirements`,
    {
      headers: {
        Authorization: jwt,
      },
      method: "GET",
    },
  );
  return await response.json();
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
        Authorization: jwt,
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
        Authorization: jwt,
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
        Authorization: jwt,
      },
      method: "GET",
    },
  );
  return await response.json();
}
