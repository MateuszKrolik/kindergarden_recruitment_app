"use client";

import { PropertyParentDocumentRequirement } from "@/data-access-layer/modules/property-management/model";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ParentDocumentRequirementsTable } from "./ParentDocumentRequirementsTable";
import { ParentDocument } from "@/data-access-layer/modules/reporting/model";
import { DocumentType } from "@/data-access-layer/shared/types/reporting";
import { ParentDocumentApprovalsTable } from "./ParentDocumentApprovalsTable";
import { PropertyParentDocument } from "@/data-access-layer/modules/compliance/model";
import { AsyncResponseType } from "@/data-access-layer/shared/types/response";

type PropertyParentDocumentTabsProps = {
  propertyId: string;
  userId: string;
  getPropertyParentDocumentRequirements(
    propertyId: string,
    userId: string,
  ): AsyncResponseType<PropertyParentDocumentRequirement[]>;
  getParentDocumentByType(
    userId: string,
    documentType: DocumentType,
  ): AsyncResponseType<ParentDocument>;
  getAllDocumentApprovalRequestsForGivenPropertyParent(
    propertyId: string,
    userId: string,
  ): AsyncResponseType<PropertyParentDocument[]>;
  getPropertyParentDocumentApprovalRequestByDocumentId(
    propertyId: string,
    userId: string,
    parentDocId: string,
  ): AsyncResponseType<PropertyParentDocument>;
  sendPropertyParentDocumentApprovalRequest(
    propertyId: string,
    userId: string,
    parentDocumentId: string,
  ): AsyncResponseType<PropertyParentDocument>;
  saveParentDocument(
    userId: string,
    documentType: DocumentType,
    file: File,
  ): AsyncResponseType<ParentDocument>;
  getDocumentURLByFilePath(
    key?: string,
    bucket?: string,
    expiresIn?: number,
  ): AsyncResponseType<string>;
};

export const PropertyParentDocumentTabs = ({
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
