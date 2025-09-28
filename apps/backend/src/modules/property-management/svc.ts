import type { PagedResponse } from "shared/types/pagination.ts";
import {
  type Property,
  type PropertyChild,
  type PropertyParentDocumentRequirement,
  CONDITION_KEY,
  type PropertyChildDocumentRequirement,
  REQUIREMENT_TYPE,
  CHILD_CONDITION_KEY,
} from "shared/types/modules/property-management.ts";
import { type IPropertyManagementRepo } from "./repo.ts";
import type { IIdentityClient } from "./client.ts";
import type {
  ParentConditionKeys,
  ChildConditionKeys,
} from "shared/types/modules/identity.ts";
import type { DocumentType } from "shared/types/modules/reporting.ts";
import { formatAggregateError } from "shared/utils/error.ts";
import type { ApiResponse } from "shared/types/response.ts";

export interface IPropertyManagementSvc {
  getAllProperties(
    pageSize: number,
    pageNumber: number,
  ): ApiResponse<PagedResponse<Property>>;
  getDocumentRequirementsForGivenPropertyParent(
    propertyId: string,
    userId: string,
  ): ApiResponse<PropertyParentDocumentRequirement[]>;
  getDocumentRequirementsForGivenPropertyChild(
    propertyId: string,
    childId: string,
  ): ApiResponse<PropertyChildDocumentRequirement[]>;
  getAllPropertyChildrenForGivenParent(
    propertyId: string,
    parentId: string,
  ): ApiResponse<PropertyChild[]>;
  getAllPropertyChildren(propertyId: string): ApiResponse<PropertyChild[]>;
  incrementPropertyChildrenPointsForGivenParent(
    propertyId: string,
    parentId: string,
    childrenIds: string[],
    pointValue: number,
  ): ApiResponse<PropertyChild[]>;
  getPointValueForGivenPropertyParentDocumentByDocumentType(
    propertyId: string,
    documentType: DocumentType,
  ): ApiResponse<number>;
  getAllPropertyChildrenPaged(
    propertyId: string,
    pageSize: number,
    pageNumber: number,
  ): ApiResponse<PagedResponse<PropertyChild>>;
}

export class PropertyManagementSvc implements IPropertyManagementSvc {
  private repo: IPropertyManagementRepo;
  private identityClient: IIdentityClient;
  constructor(repo: IPropertyManagementRepo, identityClient: IIdentityClient) {
    this.identityClient = identityClient;
    this.repo = repo;
  }
  async getAllProperties(
    pageSize: number,
    pageNumber: number,
  ): ApiResponse<PagedResponse<Property>> {
    return this.repo.getAllProperties(pageSize, pageNumber);
  }
  async getDocumentRequirementsForGivenPropertyParent(
    propertyId: string,
    userId: string,
  ): ApiResponse<PropertyParentDocumentRequirement[]> {
    const promiseResults = await Promise.all([
      this.repo.getAllPropertyParentDocumentRequirements(propertyId),
      this.identityClient.getParentConditionKeys(userId),
    ]);
    const errors = promiseResults
      .map((result) => result.error?.message)
      .filter((error) => error !== undefined);
    if (errors.length > 0)
      return {
        data: undefined,
        error: { code: 500, message: formatAggregateError(errors) },
      };
    const [allReqPromiseResult, conditionKeyPromiseResult] = promiseResults;
    const activeReqs: PropertyParentDocumentRequirement[] = [];
    allReqPromiseResult.data?.forEach(
      (element: PropertyParentDocumentRequirement) => {
        if (
          conditionKeyPromiseResult.data &&
          isParentRequirementActive(conditionKeyPromiseResult.data, element)
        ) {
          activeReqs.push(element);
        }
      },
    );
    return { data: activeReqs, error: undefined };
  }

  async getAllPropertyChildren(
    propertyId: string,
  ): ApiResponse<PropertyChild[]> {
    return await this.repo.getAllPropertyChildren(propertyId);
  }

  async getAllPropertyChildrenForGivenParent(
    propertyId: string,
    parentId: string,
  ): ApiResponse<PropertyChild[]> {
    const taskResults = await Promise.all([
      this.getAllPropertyChildren(propertyId),
      this.identityClient.getAllParentChildren(parentId),
    ]);
    const errors = taskResults
      .map((result) => result.error?.message)
      .filter((error) => error !== undefined);
    if (errors.length > 0)
      return {
        data: undefined,
        error: { code: 500, message: formatAggregateError(errors) },
      };
    const [propChildrenResult, parentChildrenResult] = taskResults;
    const propChildren = propChildrenResult.data || [];
    const parentChildren = parentChildrenResult.data || [];
    const parentChildIds = new Set(parentChildren.map((pc) => pc.child_id));
    const matchingChildren = propChildren.filter((pc) =>
      parentChildIds.has(pc.child_id),
    );
    return { data: matchingChildren, error: undefined };
  }

  async incrementPropertyChildrenPointsForGivenParent(
    propertyId: string,
    parentId: string,
    childrenIds: string[],
    pointValue: number,
  ): ApiResponse<PropertyChild[]> {
    return await this.repo.incrementPropertyChildrenPointsForGivenParent(
      propertyId,
      parentId,
      childrenIds,
      pointValue,
    );
  }

  async getPointValueForGivenPropertyParentDocumentByDocumentType(
    propertyId: string,
    documentType: DocumentType,
  ): ApiResponse<number> {
    return await this.repo.getPointValueForGivenPropertyParentDocumentByDocumentType(
      propertyId,
      documentType,
    );
  }

  async getDocumentRequirementsForGivenPropertyChild(
    propertyId: string,
    childId: string,
  ): ApiResponse<PropertyChildDocumentRequirement[]> {
    const promiseResults = await Promise.all([
      this.repo.getAllPropertyChildrenDocumentRequirements(propertyId),
      this.identityClient.getChildConditionKeys(childId),
    ]);
    const errors = promiseResults
      .map((result) => result.error?.message)
      .filter((error) => error !== undefined);
    if (errors.length > 0)
      return {
        data: undefined,
        error: { code: 500, message: formatAggregateError(errors) },
      };
    const [allReqPromiseResult, conditionKeyPromiseResult] = promiseResults;
    const activeReqs: PropertyChildDocumentRequirement[] = [];
    allReqPromiseResult.data?.forEach(
      (element: PropertyChildDocumentRequirement) => {
        if (
          conditionKeyPromiseResult.data &&
          isChildRequirementActive(conditionKeyPromiseResult.data, element)
        ) {
          activeReqs.push(element);
        }
      },
    );
    return { data: activeReqs, error: undefined };
  }

  async getAllPropertyChildrenPaged(
    propertyId: string,
    pageSize: number,
    pageNumber: number,
  ): ApiResponse<PagedResponse<PropertyChild>> {
    return await this.repo.getAllPropertyChildrenPaged(
      propertyId,
      pageSize,
      pageNumber,
    );
  }
}

function isChildRequirementActive(
  cK: ChildConditionKeys,
  r: PropertyChildDocumentRequirement,
): boolean {
  if (r.requirement_type == REQUIREMENT_TYPE.Always) {
    return true;
  }

  if (r.requirement_type == REQUIREMENT_TYPE.Conditional) {
    switch (r.condition_key) {
      case CHILD_CONDITION_KEY.HasDisability:
        return !!cK.has_disability;
      // TODO
      default:
        return false;
    }
  }
  return false;
}

function isParentRequirementActive(
  cK: ParentConditionKeys,
  r: PropertyParentDocumentRequirement,
): boolean {
  if (r.requirement_type == REQUIREMENT_TYPE.Always) {
    return true;
  }

  if (r.requirement_type == REQUIREMENT_TYPE.Conditional) {
    switch (r.condition_key) {
      case CONDITION_KEY.IsEmployed:
        return !!cK.is_employed;
      case CONDITION_KEY.IsSelfEmployed:
        return !!cK.is_self_employed;
      case CONDITION_KEY.IsStudent:
        return !!cK.is_student;
      case CONDITION_KEY.FiledTaxInDesiredLocation:
        return !!cK.filed_tax_in_desired_location;
      case CONDITION_KEY.ResidesInDesiredLocation:
        return !!cK.resides_in_desired_location;
      default:
        return false;
    }
  }
  return false;
}
