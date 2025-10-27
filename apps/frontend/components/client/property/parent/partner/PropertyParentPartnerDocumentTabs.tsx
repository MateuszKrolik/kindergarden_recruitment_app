"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiResponse } from "@/types/response";
import { PropertyParentDocumentRequirement } from "@/types/modules/property/model";
import { DOCUMENT_TYPE } from "@/types/modules/reporting/enum";
import { ParentPartnerDocument } from "@/types/modules/reporting/model";
import { PropertyParentPartnerDocument } from "@/types/modules/compliance/model";
import { PropertyParentPartnerDocumentRequest } from "@/types/modules/compliance/dto";
import { ParentPartnerDocumentRequirementsTable } from "./requirements/ParentPartnerDocumentRequirementsTable";
import { ParentPartnerDocumentApprovalsTable } from "./approvals/ParentDocumentApprovalsTable";

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
  getAllDocumentApprovalRequestsForGivenPropertyParentPartner(
    jwt: string,
    propertyId: string,
    partnerId: string,
  ): Promise<ApiResponse<PropertyParentPartnerDocument[]>>;
  getPropertyParentPartnerDocumentApprovalRequestByDocumentId(
    jwt: string,
    propertyId: string,
    partnerId: string,
    parentPartnerDocumentId: string,
  ): Promise<ApiResponse<PropertyParentPartnerDocument>>;
  sendPropertyParentPartnerDocumentApprovalRequest(
    jwt: string,
    propertyId: string,
    partnerId: string,
    parentPartnerDocumentId: string,
    body: PropertyParentPartnerDocumentRequest,
  ): Promise<ApiResponse<PropertyParentPartnerDocument>>;
  saveParentPartnerDocument(
    jwt: string,
    partnerId: string,
    documentType: DOCUMENT_TYPE,
    file: File,
  ): Promise<ApiResponse<ParentPartnerDocument>>;
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
  getAllDocumentApprovalRequestsForGivenPropertyParentPartner,
  getPropertyParentPartnerDocumentApprovalRequestByDocumentId,
  sendPropertyParentPartnerDocumentApprovalRequest,
  saveParentPartnerDocument,
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
            getPropertyParentPartnerDocumentApprovalRequestByDocumentId={
              getPropertyParentPartnerDocumentApprovalRequestByDocumentId
            }
            sendPropertyParentPartnerDocumentApprovalRequest={
              sendPropertyParentPartnerDocumentApprovalRequest
            }
            saveParentPartnerDocument={saveParentPartnerDocument}
            getDocumentURLByFilePath={getDocumentURLByFilePath}
          />
        </TabsContent>
        <TabsContent value="approval_requests">
          <ParentPartnerDocumentApprovalsTable
            jwt={jwt}
            propertyId={propertyId}
            userId={userId}
            getAllDocumentApprovalRequestsForGivenPropertyParentPartner={
              getAllDocumentApprovalRequestsForGivenPropertyParentPartner
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
