"use client";

import { PropertyParentDocumentTabs } from "./PropertyParentDocumentTabs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { getAllPropertyChildrenForGivenParent } from "@/app/actions/property-management";
import { PropertyParentChildrenDocumentTabs } from "./PropertyParentChildrenDocumentTabs";
import { ApiResponse } from "@/types/response";
import {
  PropertyChildDocumentRequirement,
  PropertyParentDocumentRequirement,
} from "@/types/modules/property/model";
import {
  CHILD_DOCUMENT_TYPE,
  DOCUMENT_TYPE,
} from "@/types/modules/reporting/enum";
import { ChildDocument, ParentDocument } from "@/types/modules/reporting/model";
import {
  PropertyChildDocument,
  PropertyParentDocument,
} from "@/types/modules/compliance/model";
import {
  PropertyChildDocumentRequest,
  PropertyParentDocumentRequest,
} from "@/types/modules/compliance/dto";

type PropertyParentPageTabsProps = {
  jwt: string;
  propertyId: string;
  userId: string;
  getPropertyParentDocumentRequirements(
    jwt: string,
    propertyId: string,
    userId: string,
  ): Promise<ApiResponse<PropertyParentDocumentRequirement[]>>;
  getParentDocumentByType(
    jwt: string,
    userId: string,
    documentType: DOCUMENT_TYPE,
  ): Promise<ApiResponse<ParentDocument>>;
  getAllDocumentApprovalRequestsForGivenPropertyParent(
    jwt: string,
    propertyId: string,
    userId: string,
  ): Promise<ApiResponse<PropertyParentDocument[]>>;
  getPropertyParentDocumentApprovalRequestByDocumentId(
    jwt: string,
    propertyId: string,
    parentId: string,
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
  sendPropertyChildDocumentApprovalRequest(
    jwt: string,
    propertyId: string,
    childId: string,
    childDocumentId: string,
    body: PropertyChildDocumentRequest,
  ): Promise<ApiResponse<PropertyChildDocument>>;
  getPropertyChildDocumentApprovalRequestByDocumentId(
    jwt: string,
    propertyId: string,
    childId: string,
    childDocId: string,
  ): Promise<ApiResponse<PropertyChildDocument>>;
  saveChildDocument(
    jwt: string,
    childId: string,
    documentType: CHILD_DOCUMENT_TYPE,
    file: File,
  ): Promise<ApiResponse<ChildDocument>>;
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
  getAllDocumentApprovalRequestsForGivenPropertyChild,
  getChildDocumentByType,
  sendPropertyChildDocumentApprovalRequest,
  getPropertyChildDocumentApprovalRequestByDocumentId,
  saveChildDocument,
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
          <PropertyParentChildrenDocumentTabs
            jwt={jwt}
            propertyId={propertyId}
            userId={userId}
            getAllPropertyChildrenForGivenParent={
              getAllPropertyChildrenForGivenParent
            }
            getPropertyChildDocumentRequirements={
              getPropertyChildDocumentRequirements
            }
            getAllDocumentApprovalRequestsForGivenPropertyChild={
              getAllDocumentApprovalRequestsForGivenPropertyChild
            }
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
        </TabsContent>
      </Tabs>
    </div>
  );
};
