"use server";

import type {
  DocumentType,
  ParentDocument,
} from "shared/types/modules/reporting";
import type { ApiResponse } from "shared/types/response";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

export async function getParentDocumentByType(
  jwt: string,
  parentId: string,
  documentType: DocumentType,
): ApiResponse<ParentDocument> {
  const response = await fetch(
    `${BACKEND_URL}/parents/${parentId}/documents/${documentType}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    },
  );
  return await response.json();
}

export async function saveParentDocument(
  jwt: string,
  parentId: string,
  documentType: DocumentType,
  file: File,
): ApiResponse<ParentDocument> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(
    `${BACKEND_URL}/parents/${parentId}/documents/${documentType}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      body: formData,
    },
  );
  return await response.json();
}

export async function getDocumentURLByFilePath(
  jwt: string,
  filePath: string,
): ApiResponse<string> {
  const response = await fetch(`${BACKEND_URL}/documents/${filePath}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });
  return await response.json();
}

export async function getParentDocumentURLByDocumentID(
  jwt: string,
  documentId: string,
): ApiResponse<string> {
  const response = await fetch(
    `${BACKEND_URL}/parent-documents/${documentId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    },
  );
  return await response.json();
}
