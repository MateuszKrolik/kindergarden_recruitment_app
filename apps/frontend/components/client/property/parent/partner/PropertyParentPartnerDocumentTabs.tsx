"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ParentDocumentApprovalsTable } from "../approvals/ParentDocumentApprovalsTable";
import { ApiResponse } from "@/types/response";
import { PropertyParentDocumentRequirement } from "@/types/modules/property/model";
import { DOCUMENT_TYPE } from "@/types/modules/reporting/enum";
import {
  ParentDocument,
  ParentPartnerDocument,
} from "@/types/modules/reporting/model";
import { PropertyParentDocument } from "@/types/modules/compliance/model";
import { PropertyParentDocumentRequest } from "@/types/modules/compliance/dto";
import { ParentPartnerDocumentRequirementsTable } from "./requirements/ParentPartnerDocumentRequirementsTable";

type PropertyParentPartnerDocumentTabsProps = {
  jwt: string;
  propertyId: string;
  userId: string;
  getPropertyParentPartnerDocumentRequirements(
    jwt: string,
    propertyId: string,
    partnerId: string,
  ): Promise<ApiResponse<PropertyParentDocumentRequirement[]>>;
  getParentPartnerDocumentByType(
    jwt: string,
    partnerId: string,
    documentType: DOCUMENT_TYPE,
  ): Promise<ApiResponse<ParentPartnerDocument>>;
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

export const PropertyParentPartnerDocumentTabs = ({
  jwt,
  propertyId,
  userId,
  getParentPartnerDocumentByType,
  getPropertyParentPartnerDocumentRequirements,
  getAllDocumentApprovalRequestsForGivenPropertyParent,
  getPropertyParentDocumentApprovalRequestByDocumentId,
  sendPropertyParentDocumentApprovalRequest,
  saveParentDocument,
  getDocumentURLByFilePath,
}: PropertyParentPartnerDocumentTabsProps) => {
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
          <ParentPartnerDocumentRequirementsTable
            jwt={jwt}
            propertyId={propertyId}
            userId={userId}
            getParentPartnerDocumentByType={getParentPartnerDocumentByType}
            getPropertyParentPartnerDocumentRequirements={
              getPropertyParentPartnerDocumentRequirements
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
