import { redisClient } from "@/data-access-layer/db/redis-client";
import { PropertyParentDocument } from "./model";
import { ComplianceRepo, IComplianceRepo } from "./repo";
import { pool } from "@/data-access-layer/db/db";
import { PagedResponse } from "@/types/pagination";

export interface IComplianceSvc {
  getAllDocumentApprovalRequestsForGivenProperty(
    propertyId: string,
    pageSize: number,
    pageNumber: number,
  ): Promise<{ data?: PagedResponse<PropertyParentDocument>; error?: Error }>;
  getAllDocumentApprovalRequestsForGivenPropertyParent(
    propertyId: string,
    userId: string,
  ): Promise<{ data?: PropertyParentDocument[]; error?: Error }>;
  getPropertyParentDocumentApprovalRequestByDocumentId(
    propertyId: string,
    userId: string,
    parentDocId: string,
  ): Promise<{ data?: PropertyParentDocument; error?: Error }>;
  sendPropertyParentDocumentApprovalRequest(
    propertyId: string,
    userId: string,
    parentDocumentId: string,
  ): Promise<{ data?: PropertyParentDocument; error?: Error }>;
}

export class ComplianceSvc implements IComplianceSvc {
  private repo: IComplianceRepo;
  constructor(repo?: IComplianceRepo) {
    this.repo = repo ?? new ComplianceRepo(pool, redisClient);
  }

  async getAllDocumentApprovalRequestsForGivenPropertyParent(
    propertyId: string,
    userId: string,
  ): Promise<{ data?: PropertyParentDocument[]; error?: Error }> {
    return this.repo.getAllDocumentApprovalRequestsForGivenPropertyParent(
      propertyId,
      userId,
    );
  }

  async getPropertyParentDocumentApprovalRequestByDocumentId(
    propertyId: string,
    userId: string,
    parentDocId: string,
  ): Promise<{ data?: PropertyParentDocument; error?: Error }> {
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
  ): Promise<{ data?: PropertyParentDocument; error?: Error }> {
    return this.repo.sendPropertyParentDocumentApprovalRequest(
      propertyId,
      userId,
      parentDocumentId,
    );
  }

  async getAllDocumentApprovalRequestsForGivenProperty(
    propertyId: string,
    pageSize: number,
    pageNumber: number,
  ): Promise<{ data?: PagedResponse<PropertyParentDocument>; error?: Error }> {
    return this.repo.getAllDocumentApprovalRequestsForGivenProperty(
      propertyId,
      pageSize,
      pageNumber,
    );
  }
}
