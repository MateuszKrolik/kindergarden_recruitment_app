"use server";

import type {
  DocumentType,
  ParentDocument,
} from "shared/types/modules/reporting";
import type { ApiResponse } from "shared/types/response";

const BASE_URL = "http://localhost:3001";

export async function getParentDocumentByType(
  jwt: string,
  parentId: string,
  documentType: DocumentType,
): ApiResponse<ParentDocument> {
  const response = await fetch(
    `${BASE_URL}/parents/${parentId}/documents/${documentType}`,
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

export async function saveParentDocument(
  jwt: string,
  parentId: string,
  documentType: DocumentType,
  file: File,
): ApiResponse<ParentDocument> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(
    `${BASE_URL}/parents/${parentId}/documents/${documentType}`,
    {
      method: "POST",
      headers: {
        Authorization: jwt,
      },
      body: formData,
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

export async function getDocumentURLByFilePath(
  jwt: string,
  filePath: string,
): ApiResponse<string> {
  const response = await fetch(`${BASE_URL}/documents/${filePath}`, {
    method: "GET",
    headers: {
      Authorization: jwt,
    },
  });
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

export async function getParentDocumentURLByDocumentID(
  jwt: string,
  documentId: string,
): ApiResponse<string> {
  const response = await fetch(`${BASE_URL}/parent-documents/${documentId}`, {
    method: "GET",
    headers: {
      Authorization: jwt,
    },
  });
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
