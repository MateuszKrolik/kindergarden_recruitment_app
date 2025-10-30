"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminPropertyChildDocumentApprovalsTable } from "./document/AdminPropertyChildDocumentApprovalsTable";
import { ApiResponse } from "@/types/response";
import { PropertyChildDocument } from "@/types/modules/compliance/model";

type AdminPropertyChildDocumentApprovalsTabsProps = {
  jwt: string;
  userId: string;
  propertyId: string;
  childId: string;
  getAllDocumentApprovalRequestsForGivenPropertyChild(
    jwt: string,
    propertyId: string,
    childId: string,
  ): Promise<ApiResponse<PropertyChildDocument[]>>;
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
};

export const AdminPropertyChildDocumentApprovalsTabs = ({
  jwt,
  userId,
  propertyId,
  childId,
  getAllDocumentApprovalRequestsForGivenPropertyChild,
  approvePropertyChildDocumentApprovalRequest,
  getChildDocumentURLByDocumentID,
}: AdminPropertyChildDocumentApprovalsTabsProps) => {
  return (
    <div className="w-full max-w-4xl">
      <Tabs defaultValue="document-requests">
        <TabsList className="mx-auto">
          <TabsTrigger value="document-requests">Document requests</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
        </TabsList>
        <TabsContent value="document-requests">
          <AdminPropertyChildDocumentApprovalsTable
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
          />
        </TabsContent>
        <TabsContent value="requests">
          <h1>{`Child ID: ${childId}`}</h1>
        </TabsContent>
      </Tabs>
    </div>
  );
};
