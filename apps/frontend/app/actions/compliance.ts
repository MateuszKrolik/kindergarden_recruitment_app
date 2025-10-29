"use server";

import { getApiClient } from "@/client";
import { ApiResponse } from "@/types/response";
import {
  PagedResponse_PropertyChildDocument,
  PagedResponse_PropertyParentDocument,
  PagedResponse_PropertyParentPartnerDocument,
  PropertyChildDocument,
  PropertyParentDocument,
  PropertyParentPartnerDocument,
} from "@/types/modules/compliance/model";
import {
  PropertyChildDocumentRequest,
  PropertyParentDocumentRequest,
  PropertyParentPartnerDocumentRequest,
} from "@/types/modules/compliance/dto";

export async function getAllDocumentApprovalRequestsForGivenPropertyParent(
  jwt: string,
  propertyId: string,
  parentId: string,
): Promise<ApiResponse<PropertyParentDocument[]>> {
  const api = getApiClient(jwt);
  const { data, error } = await api.GET(
    "/properties/{property_id}/parents/{parent_id}/parent-document-requests",
    {
      params: { path: { property_id: propertyId, parent_id: parentId } },
    },
  );
  if (error) return { data: undefined, error: error };
  return { data: data, error: undefined };
}

export async function getAllDocumentApprovalRequestsForGivenPropertyChild(
  jwt: string,
  propertyId: string,
  childId: string,
): Promise<ApiResponse<PropertyChildDocument[]>> {
  const api = getApiClient(jwt);
  const { data, error } = await api.GET(
    "/properties/{property_id}/children/{child_id}/child-document-requests",
    {
      params: { path: { property_id: propertyId, child_id: childId } },
    },
  );
  if (error) return { data: undefined, error: error };
  return { data: data, error: undefined };
}

export async function getPropertyParentDocumentApprovalRequestByDocumentId(
  jwt: string,
  propertyId: string,
  parentId: string,
  parentDocId: string,
): Promise<ApiResponse<PropertyParentDocument>> {
  const api = getApiClient(jwt);
  const { data, error } = await api.GET(
    "/properties/{property_id}/parents/{parent_id}/parent-documents/{parent_doc_id}",
    {
      params: {
        path: {
          property_id: propertyId,
          parent_id: parentId,
          parent_doc_id: parentDocId,
        },
      },
    },
  );
  if (error) return { data: undefined, error: error };
  return { data: data, error: undefined };
}

export async function sendPropertyParentDocumentApprovalRequest(
  jwt: string,
  propertyId: string,
  parentId: string,
  parentDocumentId: string,
  body: PropertyParentDocumentRequest,
): Promise<ApiResponse<PropertyParentDocument>> {
  const api = getApiClient(jwt);
  const { data, error } = await api.POST(
    "/properties/{property_id}/parents/{parent_id}/parent-documents/{parent_doc_id}",
    {
      params: {
        path: {
          property_id: propertyId,
          parent_id: parentId,
          parent_doc_id: parentDocumentId,
        },
      },
      body: body,
    },
  );
  if (error) return { data: undefined, error: error };
  return { data: data, error: undefined };
}

export async function getAllDocumentApprovalRequestsForGivenProperty(
  jwt: string,
  propertyId: string,
  pageSize: number,
  pageNumber: number,
): Promise<ApiResponse<PagedResponse_PropertyParentDocument>> {
  const api = getApiClient(jwt);
  const { data, error } = await api.GET(
    "/properties/{property_id}/parent-document-requests",
    {
      params: {
        path: {
          property_id: propertyId,
        },
        query: {
          page_size: pageSize,
          page_number: pageNumber,
        },
      },
    },
  );
  if (error) return { data: undefined, error: error };
  return { data: data, error: undefined };
}

export async function approvePropertyParentDocumentApprovalRequest(
  jwt: string,
  propertyId: string,
  parentId: string,
  parentDocumentId: string,
): Promise<ApiResponse<PropertyParentDocument>> {
  const api = getApiClient(jwt);
  const { data, error } = await api.PATCH(
    "/properties/{property_id}/parents/{parent_id}/parent-documents/{parent_document_id}/status/approved",
    {
      params: {
        path: {
          property_id: propertyId,
          parent_id: parentId,
          parent_document_id: parentDocumentId,
        },
      },
    },
  );
  if (error) return { data: undefined, error: error };
  return { data: data, error: undefined };
}

export async function getAllChildDocumentApprovalRequestsForGivenProperty(
  jwt: string,
  propertyId: string,
  pageSize: number,
  pageNumber: number,
): Promise<ApiResponse<PagedResponse_PropertyChildDocument>> {
  const api = getApiClient(jwt);
  const { data, error } = await api.GET(
    "/properties/{property_id}/child-document-requests",
    {
      params: {
        path: {
          property_id: propertyId,
        },
        query: {
          page_size: pageSize,
          page_number: pageNumber,
        },
      },
    },
  );
  if (error) return { data: undefined, error: error };
  return { data: data, error: undefined };
}

export async function sendPropertyChildDocumentApprovalRequest(
  jwt: string,
  propertyId: string,
  childId: string,
  childDocumentId: string,
  body: PropertyChildDocumentRequest,
): Promise<ApiResponse<PropertyChildDocument>> {
  const api = getApiClient(jwt);
  const { data, error } = await api.POST(
    "/properties/{property_id}/children/{child_id}/children-documents/{child_document_id}",
    {
      params: {
        path: {
          property_id: propertyId,
          child_id: childId,
          child_document_id: childDocumentId,
        },
      },
      body: body,
    },
  );
  if (error) return { data: undefined, error: error };
  return { data: data, error: undefined };
}

export async function getPropertyChildDocumentApprovalRequestByDocumentId(
  jwt: string,
  propertyId: string,
  childId: string,
  childDocId: string,
): Promise<ApiResponse<PropertyChildDocument>> {
  const api = getApiClient(jwt);
  const { data, error } = await api.GET(
    "/properties/{property_id}/children/{child_id}/child-documents/{child_document_id}",
    {
      params: {
        path: {
          property_id: propertyId,
          child_id: childId,
          child_document_id: childDocId,
        },
      },
    },
  );
  if (error) return { data: undefined, error: error };
  return { data: data, error: undefined };
}

export async function approvePropertyChildDocumentApprovalRequest(
  jwt: string,
  propertyId: string,
  childId: string,
  childDocumentId: string,
): Promise<ApiResponse<PropertyChildDocument>> {
  const api = getApiClient(jwt);
  const { data, error } = await api.PATCH(
    "/properties/{property_id}/children/{child_id}/children-documents/{child_document_id}/status/approved",
    {
      params: {
        path: {
          property_id: propertyId,
          child_id: childId,
          child_document_id: childDocumentId,
        },
      },
    },
  );
  if (error) return { data: undefined, error: error };
  return { data: data, error: undefined };
}

export async function sendPropertyParentPartnerDocumentApprovalRequest(
  jwt: string,
  propertyId: string,
  partnerId: string,
  parentPartnerDocumentId: string,
  body: PropertyParentPartnerDocumentRequest,
): Promise<ApiResponse<PropertyParentPartnerDocument>> {
  const api = getApiClient(jwt);
  const { data, error } = await api.POST(
    "/properties/{property_id}/parent-partners/{partner_id}/document-requests/{parent_partner_document_id}",
    {
      params: {
        path: {
          property_id: propertyId,
          partner_id: partnerId,
          parent_partner_document_id: parentPartnerDocumentId,
        },
      },
      body: body,
    },
  );
  if (error) return { data: undefined, error: error };
  return { data: data, error: undefined };
}

export async function getAllDocumentApprovalRequestsForGivenPropertyParentPartner(
  jwt: string,
  propertyId: string,
  partnerId: string,
): Promise<ApiResponse<PropertyParentPartnerDocument[]>> {
  const api = getApiClient(jwt);
  const { data, error } = await api.GET(
    "/properties/{property_id}/parent-partners/{partner_id}/parent-document-requests",
    {
      params: { path: { property_id: propertyId, partner_id: partnerId } },
    },
  );
  if (error) return { data: undefined, error: error };
  return { data: data, error: undefined };
}

export async function getPropertyParentPartnerDocumentApprovalRequestByDocumentId(
  jwt: string,
  propertyId: string,
  partnerId: string,
  parentPartnerDocumentId: string,
): Promise<ApiResponse<PropertyParentPartnerDocument>> {
  const api = getApiClient(jwt);
  const { data, error } = await api.GET(
    "/properties/{property_id}/parent-partners/{partner_id}/parent-documents/{parent_partner_document_id}",
    {
      params: {
        path: {
          property_id: propertyId,
          partner_id: partnerId,
          parent_partner_document_id: parentPartnerDocumentId,
        },
      },
    },
  );
  if (error) return { data: undefined, error: error };
  return { data: data, error: undefined };
}

export async function getAllPartnerDocumentApprovalRequestsForGivenProperty(
  jwt: string,
  propertyId: string,
  pageSize: number,
  pageNumber: number,
): Promise<ApiResponse<PagedResponse_PropertyParentPartnerDocument>> {
  const api = getApiClient(jwt);
  const { data, error } = await api.GET(
    "/properties/{property_id}/parent-partner-document-requests",
    {
      params: {
        path: {
          property_id: propertyId,
        },
        query: {
          page_size: pageSize,
          page_number: pageNumber,
        },
      },
    },
  );
  if (error) return { data: undefined, error: error };
  return { data: data, error: undefined };
}

export async function approvePropertyParentPartnerDocumentApprovalRequest(
  jwt: string,
  propertyId: string,
  partnerId: string,
  parentPartnerDocumentId: string,
): Promise<ApiResponse<PropertyParentPartnerDocument>> {
  const api = getApiClient(jwt);
  const { data, error } = await api.PATCH(
    "/properties/{property_id}/parent-partners/{partner_id}/parent-documents/{parent_partner_document_id}/status/approved",
    {
      params: {
        path: {
          property_id: propertyId,
          partner_id: partnerId,
          parent_partner_document_id: parentPartnerDocumentId,
        },
      },
    },
  );
  if (error) return { data: undefined, error: error };
  return { data: data, error: undefined };
}
