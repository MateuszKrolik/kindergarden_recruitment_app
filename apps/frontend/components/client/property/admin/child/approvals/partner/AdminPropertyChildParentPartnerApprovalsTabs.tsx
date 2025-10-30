"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminPropertyChildParentPartnerDocumentApprovalsTable } from "./document/AdminPropertyChildParentPartnerDocumentApprovalsTable";
import { ApiResponse } from "@/types/response";
import { PropertyParentPartnerDocument } from "@/types/modules/compliance/model";

type AdminPropertyChildParentPartnerApprovalsTabsProps = {
  jwt: string;
  userId: string;
  propertyId: string;
  parentId: string;
  getAllDocumentApprovalRequestsForGivenPropertyParentPartner(
    jwt: string,
    propertyId: string,
    partnerId: string,
  ): Promise<ApiResponse<PropertyParentPartnerDocument[]>>;
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
};

export const AdminPropertyChildParentPartnerApprovalsTabs = ({
  jwt,
  userId,
  propertyId,
  parentId,
  getAllDocumentApprovalRequestsForGivenPropertyParentPartner,
  approvePropertyParentPartnerDocumentApprovalRequest,
  getParentPartnerDocumentURLByDocumentID,
}: AdminPropertyChildParentPartnerApprovalsTabsProps) => {
  return (
    <div className="w-full max-w-4xl">
      <Tabs defaultValue="document-requests">
        <TabsList className="mx-auto">
          <TabsTrigger value="document-requests">Document requests</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
        </TabsList>
        <TabsContent value="document-requests">
          <AdminPropertyChildParentPartnerDocumentApprovalsTable
            jwt={jwt}
            userId={userId}
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
          />
        </TabsContent>
        <TabsContent value="requests">
          <h1>{`Parent Partner ID: ${parentId}`}</h1>
        </TabsContent>
      </Tabs>
    </div>
  );
};
