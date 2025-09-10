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
import identityClient from "../identity/svc";
import EventEmitter from "events";
import eventEmitter from "@/data-access-layer/eventEmitter";
import { COMPLIANCE_EVENTS } from "@/data-access-layer/shared/events/compliance";
import { EventEnvelope } from "@/data-access-layer/shared/types/event";
import { PropertyParentDocument } from "../compliance/model";

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

class PropertyManagementSvc implements IPropertyManagementSvc {
  private repo: IPropertyManagementRepo;
  constructor(
    private eventEmitter: EventEmitter,
    private identityClient: IIdentityClient,
    repo?: IPropertyManagementRepo,
  ) {
    this.repo = repo ?? new PropertyManagementRepo(pool);
    this.registerEventHandlers();
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

  private async registerEventHandlers() {
    await this.handlePropertyParentDocumentRequestApprovedEvent();
  }

  private async handlePropertyParentDocumentRequestApprovedEvent() {
    this.eventEmitter.on(
      COMPLIANCE_EVENTS.PROPERTY_PARENT_DOCUMENT_APPROVED,
      (event: EventEnvelope<PropertyParentDocument>) => {
        console.log("Received event:", event);
      },
    );
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

const propertyManagementSvc = new PropertyManagementSvc(
  eventEmitter,
  identityClient,
);
export default propertyManagementSvc;
