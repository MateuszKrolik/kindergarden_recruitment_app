import { IIdentityRepo } from "./repo";

export interface IIdentitySvc {
  doesAccountExist(accountId: string): Promise<boolean | Error>;
}

export class IdentitySvc implements IIdentitySvc {
  constructor(private repo: IIdentityRepo) { }

  async doesAccountExist(accountId: string): Promise<boolean | Error> {
    return this.repo.doesAccountExist(accountId);
  }
}
