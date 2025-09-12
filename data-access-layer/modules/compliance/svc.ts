import { redisClient } from "@/data-access-layer/db/redis-client";
import { PropertyParentDocument, RequestStatus } from "./model";
import { ComplianceRepo, IComplianceRepo } from "./repo";
import { pool } from "@/data-access-layer/db/db";
import { PagedResponse } from "@/types/pagination";
import { EventEmitter } from "stream";
import { COMPLIANCE_EVENTS } from "@/data-access-layer/shared/events/compliance";
import eventEmitter from "@/data-access-layer/eventEmitter";
import { createEvent } from "@/data-access-layer/shared/types/event";
import {Server as SocketServer} from 'socket.io'
import { getSocketServer } from "@/socketServer";

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
}

class ComplianceSvc implements IComplianceSvc {
  private repo: IComplianceRepo;
  constructor(
    private eventEmitter: EventEmitter,
    private socketServer: SocketServer | null = null,
    repo?: IComplianceRepo,
  ) {
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
    const {data, error} = await this.repo.sendPropertyParentDocumentApprovalRequest(
      propertyId,
      userId,
      parentDocumentId,
    );
    if (error) return {data: undefined, error: error}

    if (!this.socketServer) this.initSocketServer()
    this.socketServer?.emit(COMPLIANCE_EVENTS.PROPERTY_PARENT_DOCUMENT_REQUESTED, data)

    return {data, error: undefined}
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
      case RequestStatus.ApprovedStatus:
        this.eventEmitter.emit(
          COMPLIANCE_EVENTS.PROPERTY_PARENT_DOCUMENT_APPROVED,
          createEvent(
            COMPLIANCE_EVENTS.PROPERTY_PARENT_DOCUMENT_APPROVED,
            "compliance",
            "1.0",
            data,
          ),
        );
      //TODO: Rejected
    }
    return { data: data, error: undefined };
  }


  private initSocketServer() {
    const socketServer = getSocketServer();
    if (!socketServer) return
    this.socketServer = socketServer
  }
}

const complianceSvc = new ComplianceSvc(eventEmitter);
export default complianceSvc;
