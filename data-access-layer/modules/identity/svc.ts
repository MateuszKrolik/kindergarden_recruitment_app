import { pool } from "@/data-access-layer/db/db";
import { IIdentityRepo, PgIdentityRepo } from "./repo";
import { ParentConditionKeys } from "../../shared/types/property_management";

export interface IIdentitySvc {
  doesAccountExist(
    accountId: string,
  ): Promise<{ data?: boolean; error?: Error }>;
  getParentConditionKeys(
    userId: string,
  ): Promise<{ data?: ParentConditionKeys; error?: Error }>;
}

class IdentitySvc implements IIdentitySvc {
  private repo: IIdentityRepo;
  constructor(repo?: IIdentityRepo) {
    this.repo = repo ?? new PgIdentityRepo(pool);
  }

  async doesAccountExist(
    accountId: string,
  ): Promise<{ data?: boolean; error?: Error }> {
    return this.repo.doesAccountExist(accountId);
  }

  async getParentConditionKeys(
    userId: string,
  ): Promise<{ data?: ParentConditionKeys; error?: Error }> {
    return this.repo.getParentConditionKeys(userId);
  }
}

const identitySvc = new IdentitySvc();
export default identitySvc;
