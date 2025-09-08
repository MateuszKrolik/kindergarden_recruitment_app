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
  ): Promise<{ data?: PropertyParentDocumentRequirement[]; error?: Error }>;
  getParentDocumentByType(
    userId: string,
    documentType: DocumentType,
  ): Promise<{ data?: ParentDocument; error?: Error }>;
  getPropertyParentDocumentApprovalRequests(
    propertyId: string,
    userId: string,
  ): Promise<{ data?: PropertyParentDocument[]; error?: Error }>;
  getPropertyParentDocumentApprovalRequestByDocumentId(
    propertyId: string,
    userId: string,
    parentDocId: string,
  ): Promise<{ data?: PropertyParentDocument; error?: Error }>;
  sendPropertyParentDocumentApprovalRequest(
    propertyId: string,
    userId: string,
    parentDocumentId: string,
  ): Promise<{ data?: PropertyParentDocument; error?: Error }>;
  revalidateGetAllPropertyParentDocumentApprovalRequestsCacheTag(
    propertyId: string,
    userId: string,
  ): Promise<void>;
  revalidateGetPropertyParentDocumentApprovalRequestCacheTag(
    propertyId: string,
    userId: string,
    parentDocumentId: string,
  ): Promise<void>;
};

export const PropertyParentPageTabs = ({
  propertyId,
  userId,
  getParentDocumentByType,
  getPropertyParentDocumentRequirements,
  getPropertyParentDocumentApprovalRequests,
  getPropertyParentDocumentApprovalRequestByDocumentId,
  sendPropertyParentDocumentApprovalRequest,
  revalidateGetAllPropertyParentDocumentApprovalRequestsCacheTag,
  revalidateGetPropertyParentDocumentApprovalRequestCacheTag,
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
              sendPropertyParentDocumentApprovalRequest={
                sendPropertyParentDocumentApprovalRequest
              }
              revalidateGetAllPropertyParentDocumentApprovalRequestsCacheTag={
                revalidateGetAllPropertyParentDocumentApprovalRequestsCacheTag
              }
              revalidateGetPropertyParentDocumentApprovalRequestCacheTag={
                revalidateGetPropertyParentDocumentApprovalRequestCacheTag
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
