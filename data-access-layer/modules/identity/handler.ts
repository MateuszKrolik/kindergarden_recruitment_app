import { pool } from "@/data-access-layer/db/db";
import { PgIdentityRepo } from "./repo";
import { IdentitySvc, IIdentitySvc } from "./svc";

interface IIDentityHandler {
  svc: IIdentitySvc;
}

export class PostgresIdentityHandler implements IIDentityHandler {
  private repo = new PgIdentityRepo(pool);
  public readonly svc = new IdentitySvc(this.repo);
  constructor() { }
}
