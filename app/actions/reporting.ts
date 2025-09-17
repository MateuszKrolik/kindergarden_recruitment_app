"use server";

import { ParentDocument } from "@/data-access-layer/modules/reporting/model";
import svc from "@/data-access-layer/modules/reporting/svc";
import { DocumentType } from "@/data-access-layer/shared/types/reporting";

export async function getParentDocumentByType(
  userId: string,
  documentType: DocumentType,
): Promise<{ data?: ParentDocument; error?: Error }> {
  return await svc.getParentDocumentByType(userId, documentType);
}

export async function saveParentDocument(
  userId: string,
  documentType: DocumentType,
  file: File,
): Promise<{ data?: ParentDocument; error?: Error }> {
  return await svc.saveParentDocument(userId, documentType, file);
}

export async function getDocumentURLByFilePath(
  key: string,
  bucket: string = "mybucket",
  expiresIn: number = 3600,
): Promise<{ data?: string; error?: Error }> {
  return await svc.getDocumentURLByFilePath(bucket, key, expiresIn);
}

export async function getParentDocumentURLByDocumentID(
  docId: string,
): Promise<{ data?: string; error?: Error }> {
  return await svc.getParentDocumentURLByDocumentID(docId);
}
