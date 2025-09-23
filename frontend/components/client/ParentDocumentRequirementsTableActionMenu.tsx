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
import { ParentDocument } from "@/data-access-layer/modules/reporting/model";
import { DocumentType } from "@/data-access-layer/shared/types/reporting";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { getErrorMessage } from "@/util/error";
import { PropertyParentDocument } from "@/data-access-layer/modules/compliance/model";
import { Progress } from "../ui/progress";
import { AsyncResponseType } from "@/data-access-layer/shared/types/response";
import { NOT_FOUND_ERROR } from "@/data-access-layer/shared/errors";
import { PropertyParentDocumentRequirement } from "@/data-access-layer/shared/types/property-management";

type ParentDocumentRequirementsTableActionMenuProps = {
  propertyId: string;
  userId: string;
  requirement: PropertyParentDocumentRequirement;
  getParentDocumentByType(
    userId: string,
    documentType: DocumentType,
  ): AsyncResponseType<ParentDocument>;
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
    key?: string,
    bucket?: string,
    expiresIn?: number,
  ): AsyncResponseType<string>;
};

export const ParentDocumentRequirementsTableActionMenu = ({
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
        userId,
        requirement.document_type,
      );
      if (error) {
        if (error.message === NOT_FOUND_ERROR.message) {
          setIsLoading(false);
          return;
        }
        toast.error(getErrorMessage(error));
        setIsLoading(false);
        return;
      }
      setParentDoc(parentDocResult);
      const { error: approvalReqError } =
        await getPropertyParentDocumentApprovalRequestByDocumentId(
          propertyId,
          userId,
          parentDocResult.id,
        );
      if (approvalReqError) {
        if (approvalReqError.message === NOT_FOUND_ERROR.message) {
          setDisableApprovalRequest(false);
          setIsLoading(false);
          return;
        }
        toast.error(getErrorMessage(approvalReqError));
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
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={async () => {
                  const { data, error } = await getDocumentURLByFilePath(
                    parentDoc.file_path,
                  );
                  if (error) {
                    toast.error(getErrorMessage(error));
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
