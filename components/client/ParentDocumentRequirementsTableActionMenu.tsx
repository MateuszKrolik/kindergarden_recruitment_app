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
import { DocumentType } from "@/data-access-layer/shared/types/reporting";
import { useRef, useState } from "react";
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
  ): Promise<{ data?: ParentDocument; error?: Error }>;
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
};

export const ParentDocumentRequirementsTableActionMenu = ({
  propertyId,
  userId,
  requirement,
  getParentDocumentByType,
  getPropertyParentDocumentApprovalRequestByDocumentId,
  sendPropertyParentDocumentApprovalRequest,
  saveParentDocument,
}: ParentDocumentRequirementsTableActionMenuProps) => {
  const [parentDoc, setParentDoc] = useState<ParentDocument | null>(null);
  const [disableApprovalRequest, setDisableApprovalRequest] =
    useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleOnOpenChange = async (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setIsLoading(true);
      const { data: parentDocResult, error } = await getParentDocumentByType(
        userId,
        requirement.document_type,
      );
      if (error) {
        toast.error(getErrorMessage(error));
        setIsLoading(false);
        return;
      }
      if (!parentDocResult) {
        setIsLoading(false);
        return;
      }
      setParentDoc(parentDocResult);
      const { data: approvalReqResult, error: approvalReqError } =
        await getPropertyParentDocumentApprovalRequestByDocumentId(
          propertyId,
          userId,
          parentDocResult.id,
        );
      if (approvalReqError) {
        toast.error(getErrorMessage(approvalReqError));
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
    <>
      <DropdownMenu open={open} onOpenChange={handleOnOpenChange}>
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
              onClick={async () => {
                const { error } =
                  await sendPropertyParentDocumentApprovalRequest(
                    propertyId,
                    userId,
                    parentDoc.id,
                  );
                if (error) {
                  toast.error(getErrorMessage(error));
                  return;
                }
                toast.success(
                  `Successfully sent approval request for document: ${parentDoc.document_type}!`,
                );
              }}
            >
              Request approval
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem asChild>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Upload document
              </button>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem>TODO</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <input
        type="file"
        className="hidden"
        ref={fileInputRef}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const { error } = await saveParentDocument(
            userId,
            requirement.document_type,
            file,
          );
          if (error) {
            toast.error(getErrorMessage(error));
            return;
          }
          toast.success(
            `Document: ${requirement.document_type} uploaded succesfully!`,
          );
          if (file) setOpen(false);
          // reset input
          e.target.value = "";
        }}
      />
    </>
  );
};
