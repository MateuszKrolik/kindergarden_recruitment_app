import { type IIdentityRepo } from "./repo.ts";
import type {
  ParentConditionKeys,
  ChildConditionKeys,
  PropertyUser,
} from "shared/types/modules/identity.ts";
import type { ParentChild } from "shared/types/modules/identity.ts";
import type { ApiResponse } from "shared/types/response.ts";

export interface IIdentitySvc {
  doesAccountExist(accountId: string): ApiResponse<boolean>;
  getParentConditionKeys(userId: string): ApiResponse<ParentConditionKeys>;
  getChildConditionKeys(childId: string): ApiResponse<ChildConditionKeys>;
  getAllParentChildren(parentId: string): ApiResponse<ParentChild[]>;
  getPropertyUser(
    propertyId: string,
    userId: string,
  ): ApiResponse<PropertyUser>;
}

export class IdentitySvc implements IIdentitySvc {
  private repo: IIdentityRepo;
  constructor(repo: IIdentityRepo) {
    this.repo = repo;
  }

  async doesAccountExist(accountId: string): ApiResponse<boolean> {
    return await this.repo.doesAccountExist(accountId);
  }

  async getParentConditionKeys(
    userId: string,
  ): ApiResponse<ParentConditionKeys> {
    return await this.repo.getParentConditionKeys(userId);
  }

  async getAllParentChildren(parentId: string): ApiResponse<ParentChild[]> {
    return await this.repo.getAllParentChildren(parentId);
  }

  async getChildConditionKeys(
    childId: string,
  ): ApiResponse<ChildConditionKeys> {
    return await this.repo.getChildConditionKeys(childId);
  }

  async getPropertyUser(
    propertyId: string,
    userId: string,
  ): ApiResponse<PropertyUser> {
    return this.repo.getPropertyUser(propertyId, userId);
  }
}
