import { pool } from "../../db/db.ts";
import { type IIdentityRepo, PgIdentityRepo } from "./repo.ts";
import type { ParentConditionKeys } from "../../shared/types/identity.ts";
import type { ParentChild } from "../../shared/types/identity.ts";
import { redisClient } from "../../db/redis-client.ts";

export interface IIdentitySvc {
  doesAccountExist(
    accountId: string,
  ): Promise<{ data?: boolean; error?: Error }>;
  getParentConditionKeys(
    userId: string,
  ): Promise<{ data?: ParentConditionKeys; error?: Error }>;
  getAllParentChildren(
    parentId: string,
  ): Promise<{ data?: ParentChild[]; error?: Error }>;
}

class IdentitySvc implements IIdentitySvc {
  private repo: IIdentityRepo;
  constructor(repo?: IIdentityRepo) {
    this.repo = repo ?? new PgIdentityRepo(pool, redisClient);
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

  async getAllParentChildren(
    parentId: string,
  ): Promise<{ data?: ParentChild[]; error?: Error }> {
    return this.repo.getAllParentChildren(parentId);
  }
}

const identitySvc = new IdentitySvc();
export default identitySvc;
