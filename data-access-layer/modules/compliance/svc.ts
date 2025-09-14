import { redisClient, type RedisClientType } from "../../db/redis-client.ts";
import {
  type PropertyParentDocument,
  REQUEST_STATUS,
  type RequestStatus,
} from "./model.ts";
import { ComplianceRepo, type IComplianceRepo } from "./repo.ts";
import { pool } from "../../db/db.ts";
import type { PagedResponse } from "../../../types/pagination.ts";
import { COMPLIANCE_EVENTS } from "../../shared/events/compliance.ts";
import { createEvent } from "../../shared/types/event.ts";
import type { Server as SocketServer } from "socket.io";
import { getSocketServer } from "../../../socketServer.ts";

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
  setPropertyParentDocumentRequestStatus(
    propertyId: string,
    userId: string,
    parentDocumentId: string,
    requestStatus: RequestStatus,
    adminId: string,
  ): Promise<{ data?: PropertyParentDocument; error?: Error }>;
  isPropertyParentDocumentRequestApproved(
    propertyId: string,
    userId: string,
    parentDocumentId: string,
  ): Promise<{ data?: boolean; error?: Error }>;
}

class ComplianceSvc implements IComplianceSvc {
  private redisClient: RedisClientType;
  private socketServer: SocketServer | null = null;
  private repo: IComplianceRepo;
  constructor(
    redisClient: RedisClientType,
    socketServer: SocketServer | null = null,
    repo?: IComplianceRepo,
  ) {
    this.redisClient = redisClient;
    this.socketServer = socketServer;
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
    const { data, error } =
      await this.repo.sendPropertyParentDocumentApprovalRequest(
        propertyId,
        userId,
        parentDocumentId,
      );
    if (error) return { data: undefined, error: error };

    if (!this.socketServer) this.initSocketServer();
    this.socketServer?.emit(
      COMPLIANCE_EVENTS.PROPERTY_PARENT_DOCUMENT_REQUESTED,
      data,
    );

    return { data, error: undefined };
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

  async setPropertyParentDocumentRequestStatus(
    propertyId: string,
    userId: string,
    parentDocumentId: string,
    requestStatus: RequestStatus,
    adminId: string,
  ): Promise<{ data?: PropertyParentDocument; error?: Error }> {
    const { data, error } =
      await this.repo.setPropertyParentDocumentRequestStatus(
        propertyId,
        userId,
        parentDocumentId,
        requestStatus,
        adminId,
      );
    if (error) return { data: undefined, error: error };
    switch (requestStatus) {
      case REQUEST_STATUS.APPROVED:
        console.log("Emitting event...");
        this.redisClient.publish(
          COMPLIANCE_EVENTS.PROPERTY_PARENT_DOCUMENT_APPROVED,
          JSON.stringify(
            createEvent(
              COMPLIANCE_EVENTS.PROPERTY_PARENT_DOCUMENT_APPROVED,
              "compliance",
              "1.0",
              data,
            ),
          ),
        );
      //TODO: Rejected
    }
    return { data: data, error: undefined };
  }

  async isPropertyParentDocumentRequestApproved(
    propertyId: string,
    userId: string,
    parentDocumentId: string,
  ): Promise<{ data?: boolean; error?: Error }> {
    return await this.repo.isPropertyParentDocumentRequestApproved(
      propertyId,
      userId,
      parentDocumentId,
    );
  }

  private initSocketServer() {
    const socketServer = getSocketServer();
    if (!socketServer) return;
    this.socketServer = socketServer;
  }
}

const complianceSvc = new ComplianceSvc(redisClient);
export default complianceSvc;
