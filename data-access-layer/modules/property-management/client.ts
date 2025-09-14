import { DocumentType } from "../../shared/types/reporting.ts";
import type {
  ParentConditionKeys,
  ParentChild,
} from "../../shared/types/identity.ts";

export interface IIdentityClient {
  getParentConditionKeys(
    userId: string,
  ): Promise<{ data?: ParentConditionKeys; error?: Error }>;
  getAllParentChildren(
    parentId: string,
  ): Promise<{ data?: ParentChild[]; error?: Error }>;
}

export interface IComplianceClient {
  isPropertyParentDocumentRequestApproved(
    propertyId: string,
    userId: string,
    parentDocumentId: string,
  ): Promise<{ data?: boolean; error?: Error }>;
}

export interface IReportingClient {
  getParentDocumentTypeByDocumentId(
    parentDocumentId: string,
  ): Promise<{ data?: DocumentType; error?: Error }>;
}
