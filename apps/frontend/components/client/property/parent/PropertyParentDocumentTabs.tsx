"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ParentDocumentRequirementsTable } from "./requirements/ParentDocumentRequirementsTable";
import { ParentDocumentApprovalsTable } from "./approvals/ParentDocumentApprovalsTable";
import { ApiResponse } from "@/types/response";
import { PropertyParentDocumentRequirement } from "@/types/modules/property/model";
import { DOCUMENT_TYPE } from "@/types/modules/reporting/enum";
import { ParentDocument } from "@/types/modules/reporting/model";
import { PropertyParentDocument } from "@/types/modules/compliance/model";
import { PropertyParentDocumentRequest } from "@/types/modules/compliance/dto";

type PropertyParentDocumentTabsProps = {
  jwt: string;
  propertyId: string;
  userId: string;
  getPropertyParentDocumentRequirements(
    jwt: string,
    propertyId: string,
    userId: string,
  ): Promise<ApiResponse<PropertyParentDocumentRequirement[]>>;
  getParentDocumentByType(
    jwt: string,
    userId: string,
    documentType: DOCUMENT_TYPE,
  ): Promise<ApiResponse<ParentDocument>>;
  getAllDocumentApprovalRequestsForGivenPropertyParent(
    jwt: string,
    propertyId: string,
    userId: string,
  ): Promise<ApiResponse<PropertyParentDocument[]>>;
  getPropertyParentDocumentApprovalRequestByDocumentId(
    jwt: string,
    propertyId: string,
    userId: string,
    parentDocId: string,
  ): Promise<ApiResponse<PropertyParentDocument>>;
  sendPropertyParentDocumentApprovalRequest(
    jwt: string,
    propertyId: string,
    parentId: string,
    parentDocumentId: string,
    body: PropertyParentDocumentRequest,
  ): Promise<ApiResponse<PropertyParentDocument>>;
  saveParentDocument(
    jwt: string,
    userId: string,
    documentType: DOCUMENT_TYPE,
    file: File,
  ): Promise<ApiResponse<ParentDocument>>;
  getDocumentURLByFilePath(
    jwt: string,
    key: string,
  ): Promise<ApiResponse<string>>;
};

export const PropertyParentDocumentTabs = ({
  jwt,
  propertyId,
  userId,
  getParentDocumentByType,
  getPropertyParentDocumentRequirements,
  getAllDocumentApprovalRequestsForGivenPropertyParent,
  getPropertyParentDocumentApprovalRequestByDocumentId,
  sendPropertyParentDocumentApprovalRequest,
  saveParentDocument,
  getDocumentURLByFilePath,
}: PropertyParentDocumentTabsProps) => {
  return (
    <div className="w-full max-w-4xl">
      <Tabs defaultValue="document_requirements">
        <TabsList className="mx-auto">
          <TabsTrigger value="document_requirements">
            Document Requirements
          </TabsTrigger>
          <TabsTrigger value="approval_requests">Approval Requests</TabsTrigger>
        </TabsList>
        <TabsContent value="document_requirements">
          <ParentDocumentRequirementsTable
            jwt={jwt}
            propertyId={propertyId}
            userId={userId}
            getParentDocumentByType={getParentDocumentByType}
            getPropertyParentDocumentRequirements={
              getPropertyParentDocumentRequirements
            }
            getPropertyParentDocumentApprovalRequestByDocumentId={
              getPropertyParentDocumentApprovalRequestByDocumentId
            }
            sendPropertyParentDocumentApprovalRequest={
              sendPropertyParentDocumentApprovalRequest
            }
            saveParentDocument={saveParentDocument}
            getDocumentURLByFilePath={getDocumentURLByFilePath}
          />
        </TabsContent>
        <TabsContent value="approval_requests">
          <ParentDocumentApprovalsTable
            jwt={jwt}
            propertyId={propertyId}
            userId={userId}
            getAllDocumentApprovalRequestsForGivenPropertyParent={
              getAllDocumentApprovalRequestsForGivenPropertyParent
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
