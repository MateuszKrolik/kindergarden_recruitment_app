"use server";

import type { ParentDocument } from "@/data-access-layer/modules/reporting/model";
import svc from "@/data-access-layer/modules/reporting/svc";
import type { DocumentType } from "@/data-access-layer/shared/types/reporting";
import type { AsyncResponseType } from "@/data-access-layer/shared/types/response";

export async function getParentDocumentByType(
  userId: string,
  documentType: DocumentType,
): AsyncResponseType<ParentDocument> {
  return await svc.getParentDocumentByType(userId, documentType);
}

export async function saveParentDocument(
  userId: string,
  documentType: DocumentType,
  file: File,
): AsyncResponseType<ParentDocument> {
  return await svc.saveParentDocument(userId, documentType, file);
}

export async function getDocumentURLByFilePath(
  key: string,
  bucket: string = "mybucket",
  expiresIn: number = 3600,
): AsyncResponseType<string> {
  return await svc.getDocumentURLByFilePath(key, bucket, expiresIn);
}

export async function getParentDocumentURLByDocumentID(
  docId: string,
): AsyncResponseType<string> {
  return await svc.getParentDocumentURLByDocumentID(docId);
}
