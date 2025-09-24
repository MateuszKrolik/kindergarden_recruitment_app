"use client";

import {
  PropertyChildDocumentRequirement,
  PropertyParentDocumentRequirement,
} from "@/data-access-layer/shared/types/property-management";
import { ParentDocument } from "@/data-access-layer/modules/reporting/model";
import { DocumentType } from "@/data-access-layer/shared/types/reporting";
import { PropertyParentDocument } from "@/data-access-layer/shared/types/compliance";
import { PropertyParentDocumentTabs } from "./PropertyParentDocumentTabs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { PropertyParentChildrenTable } from "./PropertyParentChildrenTable";
import { getAllPropertyChildrenForGivenParent } from "@/app/actions/property-management";
import {
  ApiResponse,
  AsyncResponseType,
} from "@/data-access-layer/shared/types/response";

type PropertyParentPageTabsProps = {
  jwt: string;
  propertyId: string;
  userId: string;
  getPropertyParentDocumentRequirements(
    jwt: string,
    propertyId: string,
    userId: string,
  ): ApiResponse<PropertyParentDocumentRequirement[]>;
  getParentDocumentByType(
    userId: string,
    documentType: DocumentType,
  ): AsyncResponseType<ParentDocument>;
  getAllDocumentApprovalRequestsForGivenPropertyParent(
    jwt: string,
    propertyId: string,
    userId: string,
  ): ApiResponse<PropertyParentDocument[]>;
  getPropertyParentDocumentApprovalRequestByDocumentId(
    jwt: string,
    propertyId: string,
    parentId: string,
    parentDocId: string,
  ): ApiResponse<PropertyParentDocument>;
  sendPropertyParentDocumentApprovalRequest(
    jwt: string,
    propertyId: string,
    userId: string,
    parentDocumentId: string,
  ): ApiResponse<PropertyParentDocument>;
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
    jwt: string,
    propertyId: string,
    childId: string,
  ): ApiResponse<PropertyChildDocumentRequirement[]>;
};

export const PropertyParentPageTabs = ({
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
            jwt={jwt}
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
            jwt={jwt}
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
