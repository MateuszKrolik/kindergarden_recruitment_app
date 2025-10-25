"use server";

import { getApiClient } from "@/client";
import {
  CHILD_DOCUMENT_TYPE,
  DOCUMENT_TYPE,
} from "@/types/modules/reporting/enum";
import { ChildDocument, ParentDocument } from "@/types/modules/reporting/model";
import { ApiResponse } from "@/types/response";

export async function getParentDocumentByType(
  jwt: string,
  parentId: string,
  documentType: DOCUMENT_TYPE,
): Promise<ApiResponse<ParentDocument>> {
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
  documentType: DOCUMENT_TYPE,
  file: File,
): Promise<ApiResponse<ParentDocument>> {
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

export async function getChildDocumentByType(
  jwt: string,
  childId: string,
  documentType: CHILD_DOCUMENT_TYPE,
): Promise<ApiResponse<ChildDocument>> {
  const api = getApiClient(jwt);
  const { data, error } = await api.GET(
    "/children/{child_id}/documents/{document_type}",
    {
      params: { path: { child_id: childId, document_type: documentType } },
    },
  );
  if (error) return { data: undefined, error: error };
  return { data: data, error: undefined };
}

export async function saveChildDocument(
  jwt: string,
  childId: string,
  documentType: CHILD_DOCUMENT_TYPE,
  file: File,
): Promise<ApiResponse<ChildDocument>> {
  const api = getApiClient(jwt);
  const formData = new FormData();
  formData.append("file", file);
  const { data, error } = await api.POST(
    "/children/{child_id}/documents/{document_type}",
    {
      params: { path: { child_id: childId, document_type: documentType } },
      body: formData as unknown as { file: string },
    },
  );
  if (error) return { data: undefined, error: error };
  return { data: data, error: undefined };
}

export async function getChildDocumentURLByDocumentID(
  jwt: string,
  documentId: string,
): Promise<ApiResponse<string>> {
  const api = getApiClient(jwt);
  const { data, error } = await api.GET("/children-documents/{doc_id}", {
    params: { path: { doc_id: documentId } },
  });
  if (error) return { data: undefined, error: error };
  return { data: data, error: undefined };
}
