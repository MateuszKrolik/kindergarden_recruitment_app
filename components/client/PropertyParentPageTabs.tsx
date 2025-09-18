"use client";

import { PropertyParentDocumentRequirement } from "@/data-access-layer/modules/property-management/model";
import { ParentDocument } from "@/data-access-layer/modules/reporting/model";
import { DocumentType } from "@/data-access-layer/shared/types/reporting";
import { PropertyParentDocument } from "@/data-access-layer/modules/compliance/model";
import { PropertyParentDocumentTabs } from "./PropertyParentDocumentTabs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { PropertyParentChildrenTable } from "./PropertyParentChildrenTable";
import { getAllPropertyChildrenForGivenParent } from "@/app/actions/property-management";

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
  getAllDocumentApprovalRequestsForGivenPropertyParent(
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
  saveParentDocument(
    userId: string,
    documentType: DocumentType,
    file: File,
  ): Promise<{ data?: ParentDocument; error?: Error }>;
  getDocumentURLByFilePath(
    bucket: string,
    key: string,
    expiresIn: number,
  ): Promise<{ data?: string; error?: Error }>;
};

export const PropertyParentPageTabs = ({
  propertyId,
  userId,
  getParentDocumentByType,
  getPropertyParentDocumentRequirements,
  getAllDocumentApprovalRequestsForGivenPropertyParent,
  getPropertyParentDocumentApprovalRequestByDocumentId,
  sendPropertyParentDocumentApprovalRequest,
  saveParentDocument,
  getDocumentURLByFilePath,
}: PropertyParentPageTabsProps) => {
  return (
    <div className="w-full max-w-4xl">
      <Tabs defaultValue="my-documents">
        <TabsList className="mx-auto">
          <TabsTrigger value="my-documents">My Documents</TabsTrigger>
          <TabsTrigger value="children-documents">
            Children Documents
          </TabsTrigger>
        </TabsList>
        <TabsContent value="my-documents">
          <PropertyParentDocumentTabs
            propertyId={propertyId}
            userId={userId}
            getParentDocumentByType={getParentDocumentByType}
            getPropertyParentDocumentRequirements={
              getPropertyParentDocumentRequirements
            }
            getAllDocumentApprovalRequestsForGivenPropertyParent={
              getAllDocumentApprovalRequestsForGivenPropertyParent
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
        <TabsContent value="children-documents">
          <PropertyParentChildrenTable
            propertyId={propertyId}
            userId={userId}
            getAllPropertyChildrenForGivenParent={
              getAllPropertyChildrenForGivenParent
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
