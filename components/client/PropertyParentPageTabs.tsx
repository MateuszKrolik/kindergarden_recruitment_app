"use client";

import { PropertyParentDocumentRequirement } from "@/data-access-layer/modules/property-management/model";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ParentDocumentRequirementsTable } from "./ParentDocumentRequirementsTable";
import { ParentDocument } from "@/data-access-layer/modules/reporting/model";
import { DocumentType } from "@/data-access-layer/modules/shared/types/reporting";
import { ParentDocumentApprovalsTable } from "./ParentDocumentApprovalsTable";
import { PropertyParentDocument } from "@/data-access-layer/modules/compliance/model";

type PropertyParentPageTabsProps = {
  propertyId: string;
  userId: string;
  getPropertyParentDocumentRequirements(
    propertyId: string,
    userId: string,
  ): Promise<PropertyParentDocumentRequirement[] | Error>;
  getParentDocumentByType(
    userId: string,
    documentType: DocumentType,
  ): Promise<ParentDocument | Error>;
  getPropertyParentDocumentApprovalRequests(
    propertyId: string,
    userId: string,
  ): Promise<PropertyParentDocument[] | Error>;
  getPropertyParentDocumentApprovalRequestByDocumentId(
    propertyId: string,
    userId: string,
    parentDocId: string,
  ): Promise<PropertyParentDocument | Error>;
};

export const PropertyParentPageTabs = ({
  propertyId,
  userId,
  getParentDocumentByType,
  getPropertyParentDocumentRequirements,
  getPropertyParentDocumentApprovalRequests,
  getPropertyParentDocumentApprovalRequestByDocumentId,
}: PropertyParentPageTabsProps) => {
  return (
    <div className="min-h-[calc(90vh-80px)] flex items-center justify-center">
      <div className="w-full max-w-4xl">
        <Tabs defaultValue="document_requirements">
          <TabsList className="mx-auto">
            <TabsTrigger value="document_requirements">
              Document Requirements
            </TabsTrigger>
            <TabsTrigger value="approval_requests">
              Approval Requests
            </TabsTrigger>
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
            />
          </TabsContent>
          <TabsContent value="approval_requests">
            <ParentDocumentApprovalsTable
              propertyId={propertyId}
              userId={userId}
              getPropertyParentDocumentApprovalRequests={
                getPropertyParentDocumentApprovalRequests
              }
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
