"use client";

import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  ParentDocumentRequirementsTable,
  ParentDocumentRequirementsTableProps,
} from "./ParentDocumentRequirementsTable";

type PropertyParentPageTabsProps = {
  parentDocumentRequirementsTableProps: ParentDocumentRequirementsTableProps;
};

export const PropertyParentPageTabs = ({
  parentDocumentRequirementsTableProps: {
    propertyId,
    userId,
    getParentDocumentByType,
    getPropertyParentDocumentRequirements,
  },
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
            />
          </TabsContent>
          <TabsContent value="approval_requests">
            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>
                  Change your password here. After saving, you&apos;ll be logged
                  out.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="tabs-demo-current">Current password</Label>
                  <Input id="tabs-demo-current" type="password" />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="tabs-demo-new">New password</Label>
                  <Input id="tabs-demo-new" type="password" />
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save password</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
