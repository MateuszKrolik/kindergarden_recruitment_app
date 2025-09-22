"use client";

import {
  PropertyChildDocumentRequirement,
  PropertyParentDocumentRequirement,
} from "@/data-access-layer/modules/property-management/model";
import { ParentDocument } from "@/data-access-layer/modules/reporting/model";
import { DocumentType } from "@/data-access-layer/shared/types/reporting";
import { PropertyParentDocument } from "@/data-access-layer/modules/compliance/model";
import { PropertyParentDocumentTabs } from "./PropertyParentDocumentTabs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { PropertyParentChildrenTable } from "./PropertyParentChildrenTable";
import { getAllPropertyChildrenForGivenParent } from "@/app/actions/property-management";
import { AsyncResponseType } from "@/data-access-layer/shared/types/response";

type PropertyParentPageTabsProps = {
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
    bucket: string,
    key: string,
    expiresIn: number,
  ): AsyncResponseType<string>;
  getPropertyChildDocumentRequirements(
    propertyId: string,
    childId: string,
  ): AsyncResponseType<PropertyChildDocumentRequirement[]>;
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
  getPropertyChildDocumentRequirements,
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
            getPropertyChildDocumentRequirements={
              getPropertyChildDocumentRequirements
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
