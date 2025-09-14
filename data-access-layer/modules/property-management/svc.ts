import type { PagedResponse } from "../../../types/pagination.ts";
import {
  type Property,
  type PropertyChild,
  type PropertyParentDocumentRequirement,
  type PropertyUser,
  CONDITION_KEY,
  REQUIREMENT_TYPE,
} from "./model.ts";
import {
  type IPropertyManagementRepo,
  PropertyManagementRepo,
} from "./repo.ts";
import { pool } from "../../db/db.ts";
import type { IComplianceClient, IIdentityClient } from "./client.ts";
import type { ParentConditionKeys } from "../../shared/types/identity.ts";
import identityClient from "../identity/svc.ts";
import complianceClient from "../compliance/svc.ts";
import { redisClient } from "../../db/redis-client.ts";

export interface IPropertyManagementSvc {
  getAllProperties(
    pageSize: number,
    pageNumber: number,
  ): Promise<{ data?: PagedResponse<Property>; error?: Error }>;
  getPropertyUser(
    propertyId: string,
    userId: string,
  ): Promise<{ data?: PropertyUser; error?: Error }>;
  getDocumentRequirementsForGivenPropertyParent(
    propertyId: string,
    userId: string,
    pageSize: number,
    pageNumber: number,
  ): Promise<{ data?: PropertyParentDocumentRequirement[]; error?: Error }>;
  getAllPropertyChildrenForGivenParent(
    propertyId: string,
    parentId: string,
  ): Promise<{
    data?: PropertyChild[];
    error?: Error;
  }>;
  getAllPropertyChildren(
    propertyId: string,
  ): Promise<{ data?: PropertyChild[]; error?: Error }>;
  incrementPropertyChildrenPointsForGivenParent(
    propertyId: string,
    parentId: string,
    childrenIds: string[],
    pointValue: number,
  ): Promise<{ data?: PropertyChild[]; error?: Error }>;
  isPropertyParentDocumentRequestApproved(
    propertyId: string,
    userId: string,
    parentDocumentId: string,
  ): Promise<{ data?: boolean; error?: Error }>;
}

class PropertyManagementSvc implements IPropertyManagementSvc {
  private repo: IPropertyManagementRepo;
  private complianceClient: IComplianceClient;
  private identityClient: IIdentityClient;
  constructor(
    identityClient: IIdentityClient,
    complianceClient: IComplianceClient,
    repo?: IPropertyManagementRepo,
  ) {
    this.identityClient = identityClient;
    this.complianceClient = complianceClient;
    this.repo = repo ?? new PropertyManagementRepo(pool, redisClient);
  }
  async getAllProperties(
    pageSize: number,
    pageNumber: number,
  ): Promise<{ data?: PagedResponse<Property>; error?: Error }> {
    return this.repo.getAllProperties(pageSize, pageNumber);
  }
  async getPropertyUser(
    propertyId: string,
    userId: string,
  ): Promise<{ data?: PropertyUser; error?: Error }> {
    return this.repo.getPropertyUser(propertyId, userId);
  }
  async getDocumentRequirementsForGivenPropertyParent(
    propertyId: string,
    userId: string,
  ): Promise<{ data?: PropertyParentDocumentRequirement[]; error?: Error }> {
    const promiseResults = await Promise.all([
      this.repo.getAllPropertyParentDocumentRequirements(propertyId),
      this.identityClient.getParentConditionKeys(userId),
    ]);
    const errors = promiseResults
      .map((result) => result.error)
      .filter((error) => error !== undefined);
    if (errors.length > 0)
      return { data: undefined, error: new AggregateError(errors) };
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
  ): Promise<{ data?: PropertyChild[]; error?: Error }> {
    return await this.repo.getAllPropertyChildren(propertyId);
  }

  async getAllPropertyChildrenForGivenParent(
    propertyId: string,
    parentId: string,
  ): Promise<{
    data?: PropertyChild[];
    error?: Error;
  }> {
    const taskResults = await Promise.all([
      this.getAllPropertyChildren(propertyId),
      this.identityClient.getAllParentChildren(parentId),
    ]);
    const errors = taskResults
      .map((result) => result.error)
      .filter((error) => error !== undefined);
    if (errors.length > 0) {
      const agg = new AggregateError(
        errors,
        `Failed to aggregate property children for parent: ${parentId}!`,
      );
      return { data: undefined, error: agg };
    }
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
  ): Promise<{ data?: PropertyChild[]; error?: Error }> {
    return await this.repo.incrementPropertyChildrenPointsForGivenParent(
      propertyId,
      parentId,
      childrenIds,
      pointValue,
    );
  }

  async isPropertyParentDocumentRequestApproved(
    propertyId: string,
    userId: string,
    parentDocumentId: string,
  ): Promise<{ data?: boolean; error?: Error }> {
    return this.complianceClient.isPropertyParentDocumentRequestApproved(
      propertyId,
      userId,
      parentDocumentId,
    );
  }
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

const propertyManagementSvc = new PropertyManagementSvc(
  identityClient,
  complianceClient,
);
export default propertyManagementSvc;
