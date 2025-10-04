"use server";

import {
  PropertyChildDocument,
  PropertyParentDocument,
  RequestStatus,
} from "shared/types/modules/compliance";
import { ApiResponse } from "shared/types/response";
import { PagedResponse } from "shared/types/pagination";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

export async function getAllDocumentApprovalRequestsForGivenPropertyParent(
  jwt: string,
  propertyId: string,
  parentId: string,
): ApiResponse<PropertyParentDocument[]> {
  const response = await fetch(
    `${BACKEND_URL}/properties/${propertyId}/parents/${parentId}/parent-document-requests`,
    {
      method: "GET",
      headers: {
        Authorization: jwt,
      },
    },
  );
  return await response.json();
}

export async function getAllDocumentApprovalRequestsForGivenPropertyChild(
  jwt: string,
  propertyId: string,
  childId: string,
): ApiResponse<PropertyChildDocument[]> {
  const response = await fetch(
    `${BACKEND_URL}/properties/${propertyId}/children/${childId}/child-document-requests`,
    {
      method: "GET",
      headers: {
        Authorization: jwt,
      },
    },
  );
  return await response.json();
}

export async function getPropertyParentDocumentApprovalRequestByDocumentId(
  jwt: string,
  propertyId: string,
  parentId: string,
  parentDocId: string,
): ApiResponse<PropertyParentDocument> {
  const response = await fetch(
    `${BACKEND_URL}/properties/${propertyId}/parents/${parentId}/parent-documents/${parentDocId}`,
    {
      method: "GET",
      headers: {
        Authorization: jwt,
      },
    },
  );
  return await response.json();
}

export async function sendPropertyParentDocumentApprovalRequest(
  jwt: string,
  propertyId: string,
  parentId: string,
  parentDocumentId: string,
): ApiResponse<PropertyParentDocument> {
  const response = await fetch(
    `${BACKEND_URL}/properties/${propertyId}/parents/${parentId}/parent-documents/${parentDocumentId}`,
    {
      method: "POST",
      headers: {
        Authorization: jwt,
      },
    },
  );
  return await response.json();
}

export async function getAllDocumentApprovalRequestsForGivenProperty(
  jwt: string,
  propertyId: string,
  pageSize: number,
  pageNumber: number,
): ApiResponse<PagedResponse<PropertyParentDocument>> {
  const response = await fetch(
    `${BACKEND_URL}/properties/${propertyId}/parent-document-requests?pageSize=${pageSize}&pageNumber=${pageNumber}`,
    {
      method: "GET",
      headers: {
        Authorization: jwt,
      },
    },
  );
  return await response.json();
}

export async function setPropertyParentDocumentApprovalRequestStatus(
  jwt: string,
  propertyId: string,
  parentId: string,
  parentDocumentId: string,
  requestStatus: RequestStatus,
): ApiResponse<PropertyParentDocument> {
  const response = await fetch(
    `${BACKEND_URL}/properties/${propertyId}/parents/${parentId}/parent-documents/${parentDocumentId}/status/${requestStatus}`,
    {
      method: "PATCH",
      headers: {
        Authorization: jwt,
      },
    },
  );
  return await response.json();
}
