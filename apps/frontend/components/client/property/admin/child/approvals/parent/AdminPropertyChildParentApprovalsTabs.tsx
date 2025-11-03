"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminPropertyChildParentDocumentApprovalsTable } from "./document/AdminPropertyChildParentDocumentApprovalsTable";
import { PropertyParentDocument } from "@/types/modules/compliance/model";
import { ApiResponse } from "@/types/response";
import { RejectRequestBody } from "@/types/modules/compliance/dto";

type AdminPropertyChildParentApprovalsTabsProps = {
  jwt: string;
  propertyId: string;
  parentId: string;
  getAllDocumentApprovalRequestsForGivenPropertyParent(
    jwt: string,
    propertyId: string,
    userId: string,
  ): Promise<ApiResponse<PropertyParentDocument[]>>;
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
  rejectPropertyParentDocumentApprovalRequest(
    jwt: string,
    propertyId: string,
    parentId: string,
    parentDocumentId: string,
    body: RejectRequestBody,
  ): Promise<ApiResponse<PropertyParentDocument>>;
};

export const AdminPropertyChildParentApprovalsTabs = ({
  jwt,
  propertyId,
  parentId,
  getAllDocumentApprovalRequestsForGivenPropertyParent,
  approvePropertyParentDocumentApprovalRequest,
  getParentDocumentURLByDocumentID,
  rejectPropertyParentDocumentApprovalRequest,
}: AdminPropertyChildParentApprovalsTabsProps) => {
  return (
    <div className="w-full max-w-4xl">
      <Tabs defaultValue="document-requests">
        <TabsList className="mx-auto">
          <TabsTrigger value="document-requests">Document requests</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
        </TabsList>
        <TabsContent value="document-requests">
          <AdminPropertyChildParentDocumentApprovalsTable
            jwt={jwt}
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
        <TabsContent value="requests">
          <h1>{`Parent ID: ${parentId}`}</h1>
        </TabsContent>
      </Tabs>
    </div>
  );
};
