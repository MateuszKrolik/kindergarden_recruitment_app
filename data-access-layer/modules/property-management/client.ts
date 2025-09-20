import { DocumentType } from "../../shared/types/reporting.ts";
import type {
  ParentConditionKeys,
  ParentChild,
  ChildConditionKeys,
} from "../../shared/types/identity.ts";
import type { AsyncResponseType } from "../../shared/types/response.ts";

export interface IIdentityClient {
  getParentConditionKeys(
    userId: string,
  ): AsyncResponseType<ParentConditionKeys>;
  getAllParentChildren(parentId: string): AsyncResponseType<ParentChild[]>;
  getChildConditionKeys(childId: string): AsyncResponseType<ChildConditionKeys>;
}

export interface IComplianceClient {
  isPropertyParentDocumentRequestApproved(
    propertyId: string,
    userId: string,
    parentDocumentId: string,
  ): AsyncResponseType<boolean>;
}

export interface IReportingClient {
  getParentDocumentTypeByDocumentId(
    parentDocumentId: string,
  ): AsyncResponseType<DocumentType>;
}
