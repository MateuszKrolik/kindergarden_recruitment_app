"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminPropertyChildDocumentApprovalsTabs } from "./approvals/AdminPropertyChildApprovalsTabs";
import { AdminPropertyChildParentApprovalsTabs } from "./approvals/parent/AdminPropertyChildParentApprovalsTabs";
import { AdminPropertyChildParentPartnerApprovalsTabs } from "./approvals/partner/AdminPropertyChildParentPartnerApprovalsTabs";
import { ApiResponse } from "@/types/response";
import {
  PropertyChildDocument,
  PropertyParentDocument,
  PropertyParentPartnerDocument,
} from "@/types/modules/compliance/model";
import { RejectRequestBody } from "@/types/modules/compliance/dto";

type AdminPropertyChildTabsProps = {
  jwt: string;
  userId: string;
  propertyId: string;
  parentId: string;
  childId: string;
  getAllDocumentApprovalRequestsForGivenPropertyChild(
    jwt: string,
    propertyId: string,
    childId: string,
  ): Promise<ApiResponse<PropertyChildDocument[]>>;
  getAllDocumentApprovalRequestsForGivenPropertyParent(
    jwt: string,
    propertyId: string,
    userId: string,
  ): Promise<ApiResponse<PropertyParentDocument[]>>;
  getAllDocumentApprovalRequestsForGivenPropertyParentPartner(
    jwt: string,
    propertyId: string,
    partnerId: string,
  ): Promise<ApiResponse<PropertyParentPartnerDocument[]>>;
  approvePropertyChildDocumentApprovalRequest(
    jwt: string,
    propertyId: string,
    childId: string,
    childDocumentId: string,
  ): Promise<ApiResponse<PropertyChildDocument>>;
  getChildDocumentURLByDocumentID(
    jwt: string,
    documentId: string,
  ): Promise<ApiResponse<string>>;
  approvePropertyParentDocumentApprovalRequest(
    jwt: string,
    propertyId: string,
    userId: string,
    parentDocumentId: string,
  ): Promise<ApiResponse<PropertyParentDocument>>;
  getParentDocumentURLByDocumentID(
    jwt: string,
    docId: string,
  ): Promise<ApiResponse<string>>;
  approvePropertyParentPartnerDocumentApprovalRequest(
    jwt: string,
    propertyId: string,
    partnerId: string,
    parentPartnerDocumentId: string,
  ): Promise<ApiResponse<PropertyParentPartnerDocument>>;
  getParentPartnerDocumentURLByDocumentID(
    jwt: string,
    documentId: string,
  ): Promise<ApiResponse<string>>;
  rejectPropertyChildDocumentApprovalRequest(
    jwt: string,
    propertyId: string,
    childId: string,
    childDocumentId: string,
    body: RejectRequestBody,
  ): Promise<ApiResponse<PropertyChildDocument>>;
  rejectPropertyParentDocumentApprovalRequest(
    jwt: string,
    propertyId: string,
    parentId: string,
    parentDocumentId: string,
    body: RejectRequestBody,
  ): Promise<ApiResponse<PropertyParentDocument>>;
  rejectPropertyParentPartnerDocumentApprovalRequest(
    jwt: string,
    propertyId: string,
    partnerId: string,
    parentPartnerDocumentId: string,
    body: RejectRequestBody,
  ): Promise<ApiResponse<PropertyParentPartnerDocument>>;
};

export const AdminPropertyChildTabs = ({
  jwt,
  userId,
  propertyId,
  parentId,
  childId,
  getAllDocumentApprovalRequestsForGivenPropertyChild,
  getAllDocumentApprovalRequestsForGivenPropertyParent,
  getAllDocumentApprovalRequestsForGivenPropertyParentPartner,
  approvePropertyChildDocumentApprovalRequest,
  getChildDocumentURLByDocumentID,
  approvePropertyParentDocumentApprovalRequest,
  getParentDocumentURLByDocumentID,
  approvePropertyParentPartnerDocumentApprovalRequest,
  getParentPartnerDocumentURLByDocumentID,
  rejectPropertyChildDocumentApprovalRequest,
  rejectPropertyParentDocumentApprovalRequest,
  rejectPropertyParentPartnerDocumentApprovalRequest,
}: AdminPropertyChildTabsProps) => {
  return (
    <div className="w-full max-w-4xl">
      <Tabs defaultValue="child">
        <TabsList className="mx-auto">
          <TabsTrigger value="child">Child</TabsTrigger>
          <TabsTrigger value="parent">Parent Documents</TabsTrigger>
          <TabsTrigger value="partner">Partner Documents</TabsTrigger>
        </TabsList>
        <TabsContent value="child">
          <AdminPropertyChildDocumentApprovalsTabs
            jwt={jwt}
            userId={userId}
            propertyId={propertyId}
            childId={childId}
            getAllDocumentApprovalRequestsForGivenPropertyChild={
              getAllDocumentApprovalRequestsForGivenPropertyChild
            }
            approvePropertyChildDocumentApprovalRequest={
              approvePropertyChildDocumentApprovalRequest
            }
            getChildDocumentURLByDocumentID={getChildDocumentURLByDocumentID}
            rejectPropertyChildDocumentApprovalRequest={
              rejectPropertyChildDocumentApprovalRequest
            }
          />
        </TabsContent>
        <TabsContent value="parent">
          <AdminPropertyChildParentApprovalsTabs
            jwt={jwt}
            userId={userId}
            propertyId={propertyId}
            parentId={parentId}
            getAllDocumentApprovalRequestsForGivenPropertyParent={
              getAllDocumentApprovalRequestsForGivenPropertyParent
            }
            approvePropertyParentDocumentApprovalRequest={
              approvePropertyParentDocumentApprovalRequest
            }
            getParentDocumentURLByDocumentID={getParentDocumentURLByDocumentID}
            rejectPropertyParentDocumentApprovalRequest={
              rejectPropertyParentDocumentApprovalRequest
            }
          />
        </TabsContent>
        <TabsContent value="partner">
          <AdminPropertyChildParentPartnerApprovalsTabs
            jwt={jwt}
            propertyId={propertyId}
            parentId={parentId}
            getAllDocumentApprovalRequestsForGivenPropertyParentPartner={
              getAllDocumentApprovalRequestsForGivenPropertyParentPartner
            }
            approvePropertyParentPartnerDocumentApprovalRequest={
              approvePropertyParentPartnerDocumentApprovalRequest
            }
            getParentPartnerDocumentURLByDocumentID={
              getParentPartnerDocumentURLByDocumentID
            }
            rejectPropertyParentPartnerDocumentApprovalRequest={
              rejectPropertyParentPartnerDocumentApprovalRequest
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
