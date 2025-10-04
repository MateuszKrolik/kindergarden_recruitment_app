"use client";

import { ApiResponse } from "shared/types/response";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  PropertyChild,
  PropertyChildDocumentRequirement,
} from "shared/types/modules/property-management";
import { PropertyParentChildrenTable } from "./PropertyParentChildrenTable";
import { ParentChildDocumentApprovalsTable } from "./ParentChildDocumentApprovalsTable";
import { PropertyChildDocument } from "shared/types/modules/compliance";
import { ChildrenDocumentRequirementsTable } from "./ChildrenDocumentRequirementsTable";

type PropertyParentChildrenDocumentTabsProps = {
  jwt: string;
  propertyId: string;
  userId: string;
  getAllPropertyChildrenForGivenParent(
    jwt: string,
    propertyId: string,
    parentId: string,
  ): ApiResponse<PropertyChild[]>;
  getPropertyChildDocumentRequirements(
    jwt: string,
    propertyId: string,
    childId: string,
  ): ApiResponse<PropertyChildDocumentRequirement[]>;
  getAllDocumentApprovalRequestsForGivenPropertyChild(
    jwt: string,
    propertyId: string,
    childId: string,
  ): ApiResponse<PropertyChildDocument[]>;
};

export const PropertyParentChildrenDocumentTabs = ({
  jwt,
  propertyId,
  userId,
  getAllPropertyChildrenForGivenParent,
  getPropertyChildDocumentRequirements,
  getAllDocumentApprovalRequestsForGivenPropertyChild,
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
