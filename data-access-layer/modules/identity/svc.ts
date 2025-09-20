import { pool } from "../../db/db.ts";
import { type IIdentityRepo, PgIdentityRepo } from "./repo.ts";
import type {
  ParentConditionKeys,
  ChildConditionKeys,
} from "../../shared/types/identity.ts";
import type { ParentChild } from "../../shared/types/identity.ts";
import { redisClient } from "../../db/redis-client.ts";
import type { AsyncResponseType } from "../../shared/types/response.ts";

export interface IIdentitySvc {
  doesAccountExist(accountId: string): AsyncResponseType<boolean>;
  getParentConditionKeys(
    userId: string,
  ): AsyncResponseType<ParentConditionKeys>;
  getChildConditionKeys(childId: string): AsyncResponseType<ChildConditionKeys>;
  getAllParentChildren(parentId: string): AsyncResponseType<ParentChild[]>;
}

class IdentitySvc implements IIdentitySvc {
  private repo: IIdentityRepo;
  constructor(repo?: IIdentityRepo) {
    this.repo = repo ?? new PgIdentityRepo(pool, redisClient);
  }

  async doesAccountExist(accountId: string): AsyncResponseType<boolean> {
    return await this.repo.doesAccountExist(accountId);
  }

  async getParentConditionKeys(
    userId: string,
  ): AsyncResponseType<ParentConditionKeys> {
    return await this.repo.getParentConditionKeys(userId);
  }

  async getAllParentChildren(
    parentId: string,
  ): AsyncResponseType<ParentChild[]> {
    return await this.repo.getAllParentChildren(parentId);
  }

  async getChildConditionKeys(
    childId: string,
  ): AsyncResponseType<ChildConditionKeys> {
    return await this.repo.getChildConditionKeys(childId);
  }
}

const identitySvc = new IdentitySvc();
export default identitySvc;
