import type { DocumentType } from "shared/types/modules/reporting.ts";
import type {
  ParentConditionKeys,
  ParentChild,
  ChildConditionKeys,
} from "shared/types/modules/identity.ts";
import type { ApiResponse } from "shared/types/response.ts";

export interface IIdentityClient {
  getParentConditionKeys(userId: string): ApiResponse<ParentConditionKeys>;
  getAllParentChildren(parentId: string): ApiResponse<ParentChild[]>;
  getChildConditionKeys(childId: string): ApiResponse<ChildConditionKeys>;
}

export interface IComplianceClient {
  isPropertyParentDocumentRequestApproved(
    propertyId: string,
    userId: string,
    parentDocumentId: string,
  ): ApiResponse<boolean>;
}

export interface IReportingClient {
  getParentDocumentTypeByDocumentId(
    parentDocumentId: string,
  ): ApiResponse<DocumentType>;
}
