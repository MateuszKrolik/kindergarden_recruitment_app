"use server";

import { ParentDocument } from "@/data-access-layer/modules/reporting/model";
import { ReportingSvc } from "@/data-access-layer/modules/reporting/svc";
import { DocumentType } from "@/data-access-layer/modules/shared/types/reporting";
import { unstable_cacheTag as cacheTag } from "next/cache";

const svc = new ReportingSvc();

export async function getParentDocumentByType(
  userId: string,
  documentType: DocumentType,
): Promise<ParentDocument | Error> {
  "use cache";
  cacheTag(`parents:${userId}:${documentType}`);
  return svc.getParentDocumentByType(userId, documentType);
}
