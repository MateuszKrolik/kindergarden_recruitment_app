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
import { PropertyParentDocumentRequirement } from "@/types/modules/property/model";
import { DOCUMENT_TYPE } from "@/types/modules/reporting/enum";
import {
  ParentDocument,
  ParentPartnerDocument,
} from "@/types/modules/reporting/model";
import { PropertyParentDocument } from "@/types/modules/compliance/model";
import { PropertyParentDocumentRequest } from "@/types/modules/compliance/dto";

type ParentPartnerDocumentRequirementsTableActionMenuProps = {
  jwt: string;
  propertyId: string;
  userId: string;
  requirement: PropertyParentDocumentRequirement;
  getParentPartnerDocumentByType(
    jwt: string,
    partnerId: string,
    documentType: DOCUMENT_TYPE,
  ): Promise<ApiResponse<ParentPartnerDocument>>;
  getPropertyParentDocumentApprovalRequestByDocumentId(
    jwt: string,
    propertyId: string,
    userId: string,
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
};

export const ParentPartnerDocumentRequirementsTableActionMenu = ({
  jwt,
  propertyId,
  userId,
  requirement,
  getParentPartnerDocumentByType,
  getPropertyParentDocumentApprovalRequestByDocumentId,
  sendPropertyParentDocumentApprovalRequest,
  saveParentDocument,
  getDocumentURLByFilePath,
}: ParentPartnerDocumentRequirementsTableActionMenuProps) => {
  const [partnerDoc, setPartnerDoc] = useState<ParentPartnerDocument | null>(
    null,
  );
  const [disableApprovalRequest, setDisableApprovalRequest] =
    useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleOnOpenChange = async (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setIsLoading(true);
      const { data: partnerDocResult, error } =
        await getParentPartnerDocumentByType(
          jwt,
          userId,
          requirement.document_type,
        );
      if (error) {
        if (error.code === 404) {
          setPartnerDoc(null);
          setIsLoading(false);
          return;
        }
        toast.error(error.message);
        setPartnerDoc(null);
        setIsLoading(false);
        return;
      }
      setPartnerDoc(partnerDocResult);
      const { error: approvalReqError } =
        await getPropertyParentDocumentApprovalRequestByDocumentId(
          jwt,
          propertyId,
          userId,
          partnerDocResult.id,
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
          ) : partnerDoc ? (
            <>
              <DropdownMenuItem
                disabled={disableApprovalRequest}
                onClick={async () => {
                  const { error } =
                    await sendPropertyParentDocumentApprovalRequest(
                      jwt,
                      propertyId,
                      userId,
                      partnerDoc.id,
                      {
                        document_type: partnerDoc.document_type,
                      },
                    );
                  if (error) {
                    toast.error(error.message);
                    return;
                  }
                  toast.success(
                    `Successfully sent approval request for document: ${partnerDoc.document_type}!`,
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
                    partnerDoc.file_path,
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
