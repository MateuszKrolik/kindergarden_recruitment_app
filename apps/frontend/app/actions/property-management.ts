"use server";

import { PagedResponse } from "@/types/pagination";
import {
  Property,
  PropertyChild,
  PropertyParentDocumentRequirement,
  PropertyChildDocumentRequirement,
  PropertyUser,
} from "shared/types/modules/property-management";
import type { ApiResponse } from "shared/types/response";

const BASE_URL = "http://localhost:3001";

export async function getAllProperties(
  jwt: string,
  pageSize: number,
  pageNumber: number,
): ApiResponse<PagedResponse<Property>> {
  const response = await fetch(
    `${BASE_URL}/properties?pageSize=${pageSize}&pageNumber=${pageNumber}`,
    {
      headers: {
        Authorization: jwt,
      },
      method: "GET",
    },
  );
  const { data, error } = await response.json();
  return {
    data: data,
    error: error
      ? {
        code: response.status,
        message: error,
      }
      : undefined,
  };
}

export async function getPropertyUser(
  jwt: string,
  propertyId: string,
  userId: string,
): ApiResponse<PropertyUser> {
  const response = await fetch(
    `${BASE_URL}/properties/${propertyId}/users/${userId}`,
    {
      headers: {
        Authorization: jwt,
      },
      method: "GET",
    },
  );
  const { data, error } = await response.json();
  return {
    data: data,
    error: error
      ? {
        code: response.status,
        message: error,
      }
      : undefined,
  };
}

export async function getPropertyParentDocumentRequirements(
  jwt: string,
  propertyId: string,
  userId: string,
): ApiResponse<PropertyParentDocumentRequirement[]> {
  const response = await fetch(
    `${BASE_URL}/properties/${propertyId}/users/${userId}/parent-document-requirements`,
    {
      headers: {
        Authorization: jwt,
      },
      method: "GET",
    },
  );
  const { data, error } = await response.json();
  return {
    data: data,
    error: error
      ? {
        code: response.status,
        message: error,
      }
      : undefined,
  };
}

export async function getAllPropertyChildrenForGivenParent(
  jwt: string,
  propertyId: string,
  parentId: string,
): ApiResponse<PropertyChild[]> {
  const response = await fetch(
    `${BASE_URL}/properties/${propertyId}/parents/${parentId}/property-children`,
    {
      headers: {
        Authorization: jwt,
      },
      method: "GET",
    },
  );
  const { data, error } = await response.json();
  return {
    data: data,
    error: error
      ? {
        code: response.status,
        message: error,
      }
      : undefined,
  };
}

export async function getDocumentRequirementsForGivenPropertyChild(
  jwt: string,
  propertyId: string,
  childId: string,
): ApiResponse<PropertyChildDocumentRequirement[]> {
  const response = await fetch(
    `${BASE_URL}/properties/${propertyId}/children/${childId}/document-requirements`,
    {
      headers: {
        Authorization: jwt,
      },
      method: "GET",
    },
  );
  const { data, error } = await response.json();
  return {
    data: data,
    error: error
      ? {
        code: response.status,
        message: error,
      }
      : undefined,
  };
}

export async function getAllPropertyChildrenPaged(
  jwt: string,
  propertyId: string,
  pageSize: number,
  pageNumber: number,
): ApiResponse<PagedResponse<PropertyChild>> {
  const response = await fetch(
    `${BASE_URL}/properties/${propertyId}/property-children?pageSize=${pageSize}&pageNumber=${pageNumber}`,
    {
      headers: {
        Authorization: jwt,
      },
      method: "GET",
    },
  );
  const { data, error } = await response.json();
  return {
    data: data,
    error: error
      ? {
        code: response.status,
        message: error,
      }
      : undefined,
  };
}
