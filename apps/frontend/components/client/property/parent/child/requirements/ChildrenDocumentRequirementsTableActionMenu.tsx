import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { ApiResponse } from "@/types/response";
import { PropertyChildDocumentRequirement } from "@/types/modules/property/model";
import { CHILD_DOCUMENT_TYPE } from "@/types/modules/reporting/enum";
import { ChildDocument } from "@/types/modules/reporting/model";
import { PropertyChildDocument } from "@/types/modules/compliance/model";
import { PropertyChildDocumentRequest } from "@/types/modules/compliance/dto";

type ChildrenDocumentRequirementsTableActionMenuProps = {
  jwt: string;
  propertyId: string;
  childId: string;
  requirement: PropertyChildDocumentRequirement;
  getChildDocumentByType(
    jwt: string,
    childId: string,
    documentType: CHILD_DOCUMENT_TYPE,
  ): Promise<ApiResponse<ChildDocument>>;
  getPropertyChildDocumentApprovalRequestByDocumentId(
    jwt: string,
    propertyId: string,
    childId: string,
    childDocId: string,
  ): Promise<ApiResponse<PropertyChildDocument>>;
  sendPropertyChildDocumentApprovalRequest(
    jwt: string,
    propertyId: string,
    childId: string,
    childDocumentId: string,
    body: PropertyChildDocumentRequest,
  ): Promise<ApiResponse<PropertyChildDocument>>;
  saveChildDocument(
    jwt: string,
    userId: string,
    documentType: CHILD_DOCUMENT_TYPE,
    file: File,
  ): Promise<ApiResponse<ChildDocument>>;
  getDocumentURLByFilePath(
    jwt: string,
    key: string,
  ): Promise<ApiResponse<string>>;
};

export const ChildrenDocumentRequirementsTableActionMenu = ({
  jwt,
  propertyId,
  childId,
  requirement,
  getChildDocumentByType,
  getPropertyChildDocumentApprovalRequestByDocumentId,
  sendPropertyChildDocumentApprovalRequest,
  saveChildDocument,
  getDocumentURLByFilePath,
}: ChildrenDocumentRequirementsTableActionMenuProps) => {
  const [childDoc, setChildDoc] = useState<ChildDocument | null>(null);
  const [disableApprovalRequest, setDisableApprovalRequest] =
    useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleOnOpenChange = async (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setIsLoading(true);
      const { data: childDocResult, error } = await getChildDocumentByType(
        jwt,
        childId,
        requirement.document_type,
      );
      if (error) {
        if (error.code === 404) {
          setChildDoc(null);
          setIsLoading(false);
          return;
        }
        toast.error(error.message);
        setChildDoc(null);
        setIsLoading(false);
        return;
      }
      setChildDoc(childDocResult);
      const { error: approvalReqError } =
        await getPropertyChildDocumentApprovalRequestByDocumentId(
          jwt,
          propertyId,
          childId,
          childDocResult.id,
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
          ) : childDoc ? (
            <>
              <DropdownMenuItem
                disabled={disableApprovalRequest}
                onClick={async () => {
                  const { error } =
                    await sendPropertyChildDocumentApprovalRequest(
                      jwt,
                      propertyId,
                      childId,
                      childDoc.id,
                      {
                        document_type: childDoc.document_type,
                        point_value: requirement.point_value,
                      },
                    );
                  if (error) {
                    toast.error(error.message);
                    return;
                  }
                  toast.success(
                    `Successfully sent approval request for document: ${childDoc.document_type}!`,
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
                    childDoc.file_path,
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
          const { error } = await saveChildDocument(
            jwt,
            childId,
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
