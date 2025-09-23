"use server";

import { PagedResponse } from "@/types/pagination";
import {
  Property,
  PropertyChild,
  PropertyParentDocumentRequirement,
  PropertyChildDocumentRequirement,
  PropertyUser,
} from "@/data-access-layer/modules/property-management/model";
import type { AsyncResponseType } from "@/data-access-layer/shared/types/response";

const BASE_URL = "http://localhost:3001";

export async function getAllProperties(
  jwt: string,
  pageSize: number,
  pageNumber: number,
): AsyncResponseType<PagedResponse<Property>> {
  const response = await fetch(
    `${BASE_URL}/properties?pageSize=${pageSize}&pageNumber=${pageNumber}`,
    {
      headers: {
        Authorization: jwt,
      },
      method: "GET",
    },
  );
  return await response.json();
}

export async function getPropertyUser(
  jwt: string,
  propertyId: string,
  userId: string,
): AsyncResponseType<PropertyUser> {
  const response = await fetch(
    `${BASE_URL}/properties/${propertyId}/users/${userId}`,
    {
      headers: {
        Authorization: jwt,
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
): AsyncResponseType<PropertyParentDocumentRequirement[]> {
  const response = await fetch(
    `${BASE_URL}/properties/${propertyId}/users/${userId}/parent-document-requirements`,
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
): AsyncResponseType<PropertyChild[]> {
  const response = await fetch(
    `${BASE_URL}/properties/${propertyId}/parents/${parentId}/property-children`,
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
): AsyncResponseType<PropertyChildDocumentRequirement[]> {
  const response = await fetch(
    `${BASE_URL}/properties/${propertyId}/children/${childId}/document-requirements`,
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
): AsyncResponseType<PagedResponse<PropertyChild>> {
  const response = await fetch(
    `${BASE_URL}/properties/${propertyId}/property-children?pageSize=${pageSize}&pageNumber=${pageNumber}`,
    {
      headers: {
        Authorization: jwt,
      },
      method: "GET",
    },
  );
  return await response.json();
}
