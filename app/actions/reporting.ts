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
