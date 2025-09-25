"use server";

import {
  PropertyParentDocument,
  RequestStatus,
} from "shared/types/modules/compliance";
import { ApiResponse } from "shared/types/response";
import { PagedResponse } from "@/types/pagination";

const BASE_URL = "http://localhost:3001";

export async function getAllDocumentApprovalRequestsForGivenPropertyParent(
  jwt: string,
  propertyId: string,
  parentId: string,
): ApiResponse<PropertyParentDocument[]> {
  const response = await fetch(
    `${BASE_URL}/properties/${propertyId}/parents/${parentId}/parent-document-requests`,
    {
      method: "GET",
      headers: {
        Authorization: jwt,
      },
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

export async function getPropertyParentDocumentApprovalRequestByDocumentId(
  jwt: string,
  propertyId: string,
  parentId: string,
  parentDocId: string,
): ApiResponse<PropertyParentDocument> {
  const response = await fetch(
    `${BASE_URL}/properties/${propertyId}/parents/${parentId}/parent-documents/${parentDocId}`,
    {
      method: "GET",
      headers: {
        Authorization: jwt,
      },
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

export async function sendPropertyParentDocumentApprovalRequest(
  jwt: string,
  propertyId: string,
  parentId: string,
  parentDocumentId: string,
): ApiResponse<PropertyParentDocument> {
  const response = await fetch(
    `${BASE_URL}/properties/${propertyId}/parents/${parentId}/parent-documents/${parentDocumentId}`,
    {
      method: "POST",
      headers: {
        Authorization: jwt,
      },
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

export async function getAllDocumentApprovalRequestsForGivenProperty(
  jwt: string,
  propertyId: string,
  pageSize: number,
  pageNumber: number,
): ApiResponse<PagedResponse<PropertyParentDocument>> {
  const response = await fetch(
    `${BASE_URL}/properties/${propertyId}/parent-document-requests?pageSize=${pageSize}&pageNumber=${pageNumber}`,
    {
      method: "GET",
      headers: {
        Authorization: jwt,
      },
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

export async function setPropertyParentDocumentApprovalRequestStatus(
  jwt: string,
  propertyId: string,
  parentId: string,
  parentDocumentId: string,
  requestStatus: RequestStatus,
): ApiResponse<PropertyParentDocument> {
  const response = await fetch(
    `${BASE_URL}/properties/${propertyId}/parents/${parentId}/parent-documents/${parentDocumentId}/status/${requestStatus}`,
    {
      method: "PATCH",
      headers: {
        Authorization: jwt,
      },
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
