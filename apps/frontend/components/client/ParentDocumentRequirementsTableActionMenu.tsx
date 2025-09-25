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
import type {
  DocumentType as SharedDocumentType,
  ParentDocument,
} from "shared/types/modules/reporting";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { PropertyParentDocument } from "shared/types/modules/compliance";
import { Progress } from "../ui/progress";
import { ApiResponse } from "shared/types/response";
import { PropertyParentDocumentRequirement } from "shared/types/modules/property-management";

type ParentDocumentRequirementsTableActionMenuProps = {
  jwt: string;
  propertyId: string;
  userId: string;
  requirement: PropertyParentDocumentRequirement;
  getParentDocumentByType(
    jwt: string,
    userId: string,
    documentType: SharedDocumentType,
  ): ApiResponse<ParentDocument>;
  getPropertyParentDocumentApprovalRequestByDocumentId(
    jwt: string,
    propertyId: string,
    userId: string,
    parentDocId: string,
  ): ApiResponse<PropertyParentDocument>;
  sendPropertyParentDocumentApprovalRequest(
    jwt: string,
    propertyId: string,
    userId: string,
    parentDocumentId: string,
  ): ApiResponse<PropertyParentDocument>;
  saveParentDocument(
    jwt: string,
    userId: string,
    documentType: SharedDocumentType,
    file: File,
  ): ApiResponse<ParentDocument>;
  getDocumentURLByFilePath(jwt: string, key: string): ApiResponse<string>;
};

export const ParentDocumentRequirementsTableActionMenu = ({
  jwt,
  propertyId,
  userId,
  requirement,
  getParentDocumentByType,
  getPropertyParentDocumentApprovalRequestByDocumentId,
  sendPropertyParentDocumentApprovalRequest,
  saveParentDocument,
  getDocumentURLByFilePath,
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
        jwt,
        userId,
        requirement.document_type,
      );
      if (error) {
        if (error.code === 404) {
          setIsLoading(false);
          return;
        }
        toast.error(error.message);
        setIsLoading(false);
        return;
      }
      setParentDoc(parentDocResult);
      const { error: approvalReqError } =
        await getPropertyParentDocumentApprovalRequestByDocumentId(
          jwt,
          propertyId,
          userId,
          parentDocResult.id,
        );
      if (approvalReqError) {
        if (approvalReqError.code === 404) {
          setDisableApprovalRequest(false);
          setIsLoading(false);
          return;
        }
        toast.error(approvalReqError.message);
        setIsLoading(false);
        return;
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
            <>
              <DropdownMenuItem
                disabled={disableApprovalRequest}
                onClick={async () => {
                  const { error } =
                    await sendPropertyParentDocumentApprovalRequest(
                      jwt,
                      propertyId,
                      userId,
                      parentDoc.id,
                    );
                  if (error) {
                    toast.error(error.message);
                    return;
                  }
                  toast.success(
                    `Successfully sent approval request for document: ${parentDoc.document_type}!`,
                  );
                }}
              >
                Request approval
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={async () => {
                  const { data, error } = await getDocumentURLByFilePath(
                    jwt,
                    parentDoc.file_path,
                  );
                  if (error) {
                    toast.error(error.message);
                    return;
                  }
                  window.open(data, "_blank");
                }}
              >
                View document
              </DropdownMenuItem>
            </>
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
            jwt,
            userId,
            requirement.document_type,
            file,
          );
          if (error) {
            toast.error(error.message);
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
