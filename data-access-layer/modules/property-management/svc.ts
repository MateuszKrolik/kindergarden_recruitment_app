import { PagedResponse } from "@/types/pagination";
import {
  ConditionKey,
  Property,
  PropertyParentDocumentRequirement,
  PropertyUser,
  RequirementType,
} from "./model";
import { IPropertyManagementRepo, PropertyManagementRepo } from "./repo";
import { pool } from "@/data-access-layer/db/db";
import { IIdentityClient } from "./client";
import { ParentConditionKeys } from "@/data-access-layer/shared/types/property_management";

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
}

export class PropertyManagementSvc implements IPropertyManagementSvc {
  private repo: IPropertyManagementRepo;
  constructor(
    private identityClient: IIdentityClient,
    repo?: IPropertyManagementRepo,
  ) {
    this.repo = repo ?? new PropertyManagementRepo(pool);
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
    const [allReqPromiseResult, conditionKeyPromiseResult] = await Promise.all([
      this.repo.getAllPropertyParentDocumentRequirements(propertyId),
      this.identityClient.getParentConditionKeys(userId),
    ]);
    if (allReqPromiseResult.error)
      return { data: undefined, error: allReqPromiseResult.error };
    if (conditionKeyPromiseResult.error)
      return { data: undefined, error: conditionKeyPromiseResult.error };
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
}

function isParentRequirementActive(
  cK: ParentConditionKeys,
  r: PropertyParentDocumentRequirement,
): boolean {
  if (r.requirement_type == RequirementType.Always) {
    return true;
  }

  if (r.requirement_type == RequirementType.Conditional) {
    switch (r.condition_key) {
      case ConditionKey.IsEmployed:
        return !!cK.is_employed;
      case ConditionKey.IsSelfEmployed:
        return !!cK.is_self_employed;
      case ConditionKey.IsStudent:
        return !!cK.is_student;
      case ConditionKey.FiledTaxInDesiredLocation:
        return !!cK.filed_tax_in_desired_location;
      case ConditionKey.ResidesInDesiredLocation:
        return !!cK.resides_in_desired_location;
      default:
        return false;
    }
  }
  return false;
}
