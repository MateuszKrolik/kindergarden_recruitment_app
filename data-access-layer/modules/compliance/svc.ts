import { PropertyParentDocument } from "./model";
import { ComplianceRepo, IComplianceRepo } from "./repo";
import { pool } from "@/data-access-layer/db/db";

export interface IComplianceSvc {
  getPropertyParentDocumentApprovalRequests(
    propertyId: string,
    userId: string,
  ): Promise<PropertyParentDocument[] | Error>;
  getPropertyParentDocumentApprovalRequestByDocumentId(
    propertyId: string,
    userId: string,
    parentDocId: string,
  ): Promise<PropertyParentDocument | Error>;
  sendPropertyParentDocumentApprovalRequest(
    propertyId: string,
    userId: string,
    parentDocumentId: string,
  ): Promise<PropertyParentDocument | Error>;
}

export class ComplianceSvc implements IComplianceSvc {
  private repo: IComplianceRepo;
  constructor(repo?: IComplianceRepo) {
    this.repo = repo ?? new ComplianceRepo(pool);
  }

  async getPropertyParentDocumentApprovalRequests(
    propertyId: string,
    userId: string,
  ): Promise<PropertyParentDocument[] | Error> {
    return this.repo.getPropertyParentDocumentApprovalRequests(
      propertyId,
      userId,
    );
  }

  async getPropertyParentDocumentApprovalRequestByDocumentId(
    propertyId: string,
    userId: string,
    parentDocId: string,
  ): Promise<PropertyParentDocument | Error> {
    return this.repo.getPropertyParentDocumentApprovalRequestByDocumentId(
      propertyId,
      userId,
      parentDocId,
    );
  }

  async sendPropertyParentDocumentApprovalRequest(
    propertyId: string,
    userId: string,
    parentDocumentId: string,
  ): Promise<PropertyParentDocument | Error> {
    return this.repo.sendPropertyParentDocumentApprovalRequest(
      propertyId,
      userId,
      parentDocumentId,
    );
  }
}
