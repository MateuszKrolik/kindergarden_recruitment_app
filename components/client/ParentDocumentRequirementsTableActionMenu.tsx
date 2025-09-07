import { MoreHorizontal } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "../ui/dropdown-menu";
import { PropertyParentDocumentRequirement } from "@/data-access-layer/modules/property-management/model";
import { ParentDocument } from "@/data-access-layer/modules/reporting/model";
import { DocumentType } from "@/data-access-layer/modules/shared/types/reporting";
import { useState } from "react";
import { toast } from "sonner";
import { getErrorMessage } from "@/util/error";
import { PropertyParentDocument } from "@/data-access-layer/modules/compliance/model";
import { Progress } from "../ui/progress";

type ParentDocumentRequirementsTableActionMenuProps = {
  propertyId: string;
  userId: string;
  requirement: PropertyParentDocumentRequirement;
  getParentDocumentByType(
    userId: string,
    documentType: DocumentType,
  ): Promise<ParentDocument | Error>;
  getPropertyParentDocumentApprovalRequestByDocumentId(
    propertyId: string,
    userId: string,
    parentDocId: string,
  ): Promise<PropertyParentDocument | Error>;
};

export const ParentDocumentRequirementsTableActionMenu = ({
  propertyId,
  userId,
  requirement,
  getParentDocumentByType,
  getPropertyParentDocumentApprovalRequestByDocumentId,
}: ParentDocumentRequirementsTableActionMenuProps) => {
  const [parentDoc, setParentDoc] = useState<ParentDocument | null>(null);
  const [disableApprovalRequest, setDisableApprovalRequest] =
    useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleOnOpenChange = async (open: boolean) => {
    if (open) {
      setIsLoading(true);
      const parentDocResult = await getParentDocumentByType(
        userId,
        requirement.document_type,
      );
      if (parentDocResult instanceof Error) {
        toast.error(getErrorMessage(parentDocResult));
        setIsLoading(false);
        return;
      }
      setParentDoc(parentDocResult);
      if (!parentDocResult) {
        setIsLoading(false);
        return;
      }
      const approvalReqResult =
        await getPropertyParentDocumentApprovalRequestByDocumentId(
          propertyId,
          userId,
          parentDocResult.id,
        );
      if (approvalReqResult instanceof Error) {
        toast.error(getErrorMessage(approvalReqResult));
        setIsLoading(false);
        return;
      }
      if (!approvalReqResult) {
        setDisableApprovalRequest(false);
      }
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  };
  return (
    <DropdownMenu onOpenChange={handleOnOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        {isLoading ? (
          <DropdownMenuItem>
            <Progress value={33} />
          </DropdownMenuItem>
        ) : parentDoc ? (
          <DropdownMenuItem
            disabled={disableApprovalRequest}
            onClick={() =>
              navigator.clipboard.writeText(requirement.document_type)
            }
          >
            Request approval
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={() =>
              navigator.clipboard.writeText(requirement.document_type)
            }
          >
            Upload document
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem>TODO</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
