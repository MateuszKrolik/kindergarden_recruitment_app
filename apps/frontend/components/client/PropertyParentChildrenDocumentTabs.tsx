"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { PropertyParentChildrenTable } from "./PropertyParentChildrenTable";
import { ParentChildDocumentApprovalsTable } from "./ParentChildDocumentApprovalsTable";
import { ChildrenDocumentRequirementsTable } from "./ChildrenDocumentRequirementsTable";
import { ApiResponse } from "@/types/response";
import { components } from "@/client/schema";

type PropertyParentChildrenDocumentTabsProps = {
  jwt: string;
  propertyId: string;
  userId: string;
  getAllPropertyChildrenForGivenParent(
    jwt: string,
    propertyId: string,
    parentId: string,
  ): Promise<ApiResponse<components["schemas"]["PropertyChild"][]>>;
  getPropertyChildDocumentRequirements(
    jwt: string,
    propertyId: string,
    childId: string,
  ): Promise<
    ApiResponse<components["schemas"]["PropertyChildDocumentRequirement"][]>
  >;
  getAllDocumentApprovalRequestsForGivenPropertyChild(
    jwt: string,
    propertyId: string,
    childId: string,
  ): Promise<ApiResponse<components["schemas"]["PropertyChildDocument"][]>>;
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
