"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PropertyParentChildrenTable } from "./PropertyParentChildrenTable";
import { ParentChildDocumentApprovalsTable } from "./approvals/ParentChildDocumentApprovalsTable";
import { ChildrenDocumentRequirementsTable } from "./requirements/ChildrenDocumentRequirementsTable";
import { ApiResponse } from "@/types/response";
import {
  PropertyChild,
  PropertyChildDocumentRequirement,
} from "@/types/modules/property/model";
import { PropertyChildDocument } from "@/types/modules/compliance/model";
import { CHILD_DOCUMENT_TYPE } from "@/types/modules/reporting/enum";
import { ChildDocument } from "@/types/modules/reporting/model";
import { PropertyChildDocumentRequest } from "@/types/modules/compliance/dto";

type PropertyParentChildrenDocumentTabsProps = {
  jwt: string;
  propertyId: string;
  userId: string;
  getAllPropertyChildrenForGivenParent(
    jwt: string,
    propertyId: string,
    parentId: string,
  ): Promise<ApiResponse<PropertyChild[]>>;
  getPropertyChildDocumentRequirements(
    jwt: string,
    propertyId: string,
    childId: string,
  ): Promise<ApiResponse<PropertyChildDocumentRequirement[]>>;
  getAllDocumentApprovalRequestsForGivenPropertyChild(
    jwt: string,
    propertyId: string,
    childId: string,
  ): Promise<ApiResponse<PropertyChildDocument[]>>;
  getChildDocumentByType(
    jwt: string,
    childId: string,
    documentType: CHILD_DOCUMENT_TYPE,
  ): Promise<ApiResponse<ChildDocument>>;
  getPropertyChildDocumentApprovalRequestByDocumentId(
    jwt: string,
    propertyId: string,
    childId: string,
    childDocId: string,
  ): Promise<ApiResponse<PropertyChildDocument>>;
  sendPropertyChildDocumentApprovalRequest(
    jwt: string,
    propertyId: string,
    childId: string,
    childDocumentId: string,
    body: PropertyChildDocumentRequest,
  ): Promise<ApiResponse<PropertyChildDocument>>;
  saveChildDocument(
    jwt: string,
    childId: string,
    documentType: CHILD_DOCUMENT_TYPE,
    file: File,
  ): Promise<ApiResponse<ChildDocument>>;
  getDocumentURLByFilePath(
    jwt: string,
    key: string,
  ): Promise<ApiResponse<string>>;
};

export const PropertyParentChildrenDocumentTabs = ({
  jwt,
  propertyId,
  userId,
  getAllPropertyChildrenForGivenParent,
  getPropertyChildDocumentRequirements,
  getAllDocumentApprovalRequestsForGivenPropertyChild,
  getChildDocumentByType,
  getPropertyChildDocumentApprovalRequestByDocumentId,
  sendPropertyChildDocumentApprovalRequest,
  saveChildDocument,
  getDocumentURLByFilePath,
}: PropertyParentChildrenDocumentTabsProps) => {
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
          <PropertyParentChildrenTable
            jwt={jwt}
            propertyId={propertyId}
            userId={userId}
            getAllPropertyChildrenForGivenParent={
              getAllPropertyChildrenForGivenParent
            }
            renderCollapsibleContentAction={(row) => (
              <ChildrenDocumentRequirementsTable
                jwt={jwt}
                propertyId={propertyId}
                childId={row.child_id}
                getPropertyChildDocumentRequirements={
                  getPropertyChildDocumentRequirements
                }
                key={row.child_id}
                getChildDocumentByType={getChildDocumentByType}
                getPropertyChildDocumentApprovalRequestByDocumentId={
                  getPropertyChildDocumentApprovalRequestByDocumentId
                }
                sendPropertyChildDocumentApprovalRequest={
                  sendPropertyChildDocumentApprovalRequest
                }
                saveChildDocument={saveChildDocument}
                getDocumentURLByFilePath={getDocumentURLByFilePath}
              />
            )}
          />
        </TabsContent>
        <TabsContent value="approval_requests">
          <PropertyParentChildrenTable
            jwt={jwt}
            propertyId={propertyId}
            userId={userId}
            getAllPropertyChildrenForGivenParent={
              getAllPropertyChildrenForGivenParent
            }
            renderCollapsibleContentAction={(row) => (
              <ParentChildDocumentApprovalsTable
                jwt={jwt}
                propertyId={row.property_id}
                childId={row.child_id}
                getAllDocumentApprovalRequestsForGivenPropertyChild={
                  getAllDocumentApprovalRequestsForGivenPropertyChild
                }
              />
            )}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
