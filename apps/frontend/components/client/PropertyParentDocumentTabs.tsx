"use client";

import { PropertyParentDocumentRequirement } from "shared/types/modules/property-management";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ParentDocumentRequirementsTable } from "./ParentDocumentRequirementsTable";
import { ParentDocument, DocumentType } from "shared/types/modules/reporting";
import { ParentDocumentApprovalsTable } from "./ParentDocumentApprovalsTable";
import { PropertyParentDocument } from "shared/types/modules/compliance";
import { ApiResponse } from "shared/types/response";

type PropertyParentDocumentTabsProps = {
  jwt: string;
  propertyId: string;
  userId: string;
  getPropertyParentDocumentRequirements(
    jwt: string,
    propertyId: string,
    userId: string,
  ): ApiResponse<PropertyParentDocumentRequirement[]>;
  getParentDocumentByType(
    jwt: string,
    userId: string,
    documentType: DocumentType,
  ): ApiResponse<ParentDocument>;
  getAllDocumentApprovalRequestsForGivenPropertyParent(
    jwt: string,
    propertyId: string,
    userId: string,
  ): ApiResponse<PropertyParentDocument[]>;
  getPropertyParentDocumentApprovalRequestByDocumentId(
    jwt: string,
    propertyId: string,
    userId: string,
    parentDocId: string,
  ): ApiResponse<PropertyParentDocument>;
  sendPropertyParentDocumentApprovalRequest(
    jwt: string,
    propertyId: string,
    userId: string,
    parentDocumentId: string,
  ): ApiResponse<PropertyParentDocument>;
  saveParentDocument(
    jwt: string,
    userId: string,
    documentType: DocumentType,
    file: File,
  ): ApiResponse<ParentDocument>;
  getDocumentURLByFilePath(jwt: string, key: string): ApiResponse<string>;
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
