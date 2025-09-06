import { pool } from "@/data-access-layer/db/db";
import { IIdentityRepo, PgIdentityRepo } from "./repo";

export interface IIdentitySvc {
  doesAccountExist(accountId: string): Promise<boolean | Error>;
}

export class IdentitySvc implements IIdentitySvc {
  private repo: IIdentityRepo;
  constructor(repo?: IIdentityRepo) {
    this.repo = repo ?? new PgIdentityRepo(pool);
  }

  async doesAccountExist(accountId: string): Promise<boolean | Error> {
    return this.repo.doesAccountExist(accountId);
  }
}
