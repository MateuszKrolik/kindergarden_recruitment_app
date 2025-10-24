"use server";

import { getApiClient } from "@/client";
import { components } from "@/client/schema";
import { ApiResponse } from "@/types/response";

export async function getParentDocumentByType(
  jwt: string,
  parentId: string,
  documentType: components["schemas"]["DOCUMENT_TYPE"],
): Promise<ApiResponse<components["schemas"]["ParentDocument"]>> {
  const api = getApiClient(jwt);
  const { data, error } = await api.GET(
    "/parents/{parent_id}/documents/{document_type}",
    {
      params: { path: { parent_id: parentId, document_type: documentType } },
    },
  );
  if (error) return { data: undefined, error: error };
  return { data: data, error: undefined };
}

export async function saveParentDocument(
  jwt: string,
  parentId: string,
  documentType: components["schemas"]["DOCUMENT_TYPE"],
  file: File,
): Promise<ApiResponse<components["schemas"]["ParentDocument"]>> {
  const api = getApiClient(jwt);
  const formData = new FormData();
  formData.append("file", file);
  const { data, error } = await api.POST(
    "/parents/{parent_id}/documents/{document_type}",
    {
      params: { path: { parent_id: parentId, document_type: documentType } },
      body: formData as unknown as { file: string },
    },
  );
  if (error) return { data: undefined, error: error };
  return { data: data, error: undefined };
}

export async function getDocumentURLByFilePath(
  jwt: string,
  filePath: string,
): Promise<ApiResponse<string>> {
  const api = getApiClient(jwt);
  const { data, error } = await api.GET("/documents/{file_path}", {
    params: { path: { file_path: filePath } },
  });
  if (error) return { data: undefined, error: error };
  return { data: data, error: undefined };
}

export async function getParentDocumentURLByDocumentID(
  jwt: string,
  documentId: string,
): Promise<ApiResponse<string>> {
  const api = getApiClient(jwt);
  const { data, error } = await api.GET("/parent-documents/{doc_id}", {
    params: { path: { doc_id: documentId } },
  });
  if (error) return { data: undefined, error: error };
  return { data: data, error: undefined };
}
