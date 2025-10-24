"use server";

import { getApiClient } from "@/client";
import { components } from "@/client/schema";
import { ApiResponse } from "@/types/response";

export async function getAllProperties(
  jwt: string,
  pageSize: number,
  pageNumber: number,
): Promise<ApiResponse<components["schemas"]["PagedResponse_Property_"]>> {
  const api = getApiClient(jwt);
  const { data, error } = await api.GET("/properties", {
    params: { query: { page_size: pageSize, page_number: pageNumber } },
  });
  if (error) return { data: undefined, error: error };
  return { data: data, error: undefined };
}

export async function getPropertyParentDocumentRequirements(
  jwt: string,
  propertyId: string,
  userId: string,
): Promise<
  ApiResponse<components["schemas"]["PropertyParentDocumentRequirement"][]>
> {
  const api = getApiClient(jwt);
  const { data, error } = await api.GET(
    "/properties/{property_id}/users/{user_id}/parent-document-requirements",
    {
      params: { path: { property_id: propertyId, user_id: userId } },
    },
  );
  if (error) return { data: undefined, error: error };
  return { data: data, error: undefined };
}

export async function getAllPropertyChildrenForGivenParent(
  jwt: string,
  propertyId: string,
  parentId: string,
): Promise<ApiResponse<components["schemas"]["PropertyChild"][]>> {
  const api = getApiClient(jwt);
  const { data, error } = await api.GET(
    "/properties/{property_id}/parents/{parent_id}/property-children",
    {
      params: { path: { property_id: propertyId, parent_id: parentId } },
    },
  );
  if (error) return { data: undefined, error: error };
  return { data: data, error: undefined };
}

export async function getDocumentRequirementsForGivenPropertyChild(
  jwt: string,
  propertyId: string,
  childId: string,
): Promise<
  ApiResponse<components["schemas"]["PropertyChildDocumentRequirement"][]>
> {
  const api = getApiClient(jwt);
  const { data, error } = await api.GET(
    "/properties/{property_id}/children/{child_id}/document-requirements",
    { params: { path: { property_id: propertyId, child_id: childId } } },
  );
  if (error) return { data: undefined, error: error };
  return { data: data, error: undefined };
}

export async function getAllPropertyChildrenPaged(
  jwt: string,
  propertyId: string,
  pageSize: number,
  pageNumber: number,
): Promise<ApiResponse<components["schemas"]["PagedResponse_PropertyChild_"]>> {
  const api = getApiClient(jwt);
  const { data, error } = await api.GET(
    "/properties/{property_id}/property-children",
    {
      params: {
        path: { property_id: propertyId },
        query: { page_size: pageSize, page_number: pageNumber },
      },
    },
  );
  if (error) return { data: undefined, error: error };
  return { data: data, error: undefined };
}
