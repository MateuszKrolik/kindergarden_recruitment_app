import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { ApiResponse } from "@/types/response";
import { PropertyParentPartnerDocument } from "@/types/modules/compliance/model";
import { REQUEST_STATUS } from "@/types/modules/compliance/enum";

type AdminPropertyParentPartnerDocumentTableActionMenuProps = {
  jwt: string;
  adminId: string;
  request: PropertyParentPartnerDocument;
  approvePropertyParentPartnerDocumentApprovalRequest(
    jwt: string,
    propertyId: string,
    partnerId: string,
    parentPartnerDocumentId: string,
  ): Promise<ApiResponse<PropertyParentPartnerDocument>>;
  getParentPartnerDocumentURLByDocumentID(
    jwt: string,
    documentId: string,
  ): Promise<ApiResponse<string>>;
};

export default function AdminPropertyParentPartnerDocumentTableActionMenu({
  jwt,
  adminId,
  request,
  approvePropertyParentPartnerDocumentApprovalRequest,
  getParentPartnerDocumentURLByDocumentID,
}: AdminPropertyParentPartnerDocumentTableActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <SetStatusDropdownMenuItem
          jwt={jwt}
          adminId={adminId}
          request={request}
          approvePropertyParentPartnerDocumentApprovalRequest={
            approvePropertyParentPartnerDocumentApprovalRequest
          }
        />
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            const { data, error } =
              await getParentPartnerDocumentURLByDocumentID(
                jwt,
                request.parent_partner_document_id,
              );
            if (error) {
              toast.error(error.message);
              return;
            }
            if (!data) return;
            window.open(data, "_blank");
          }}
        >
          View document
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

type SetStatusDropdownMenuItemProps = {
  jwt: string;
  adminId: string;
  request: PropertyParentPartnerDocument;
  approvePropertyParentPartnerDocumentApprovalRequest(
    jwt: string,
    propertyId: string,
    partnerId: string,
    parentPartnerDocumentId: string,
  ): Promise<ApiResponse<PropertyParentPartnerDocument>>;
};

const SetStatusDropdownMenuItem = ({
  jwt,
  request,
  approvePropertyParentPartnerDocumentApprovalRequest,
}: SetStatusDropdownMenuItemProps) => {
  const handleStatusChange = async (status: REQUEST_STATUS) => {
    switch (status) {
      case "approved":
        const { error } =
          await approvePropertyParentPartnerDocumentApprovalRequest(
            jwt,
            request.property_id,
            request.partner_id,
            request.parent_partner_document_id,
          );
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success(
          `Request: '${request.parent_partner_document_id}' approved successfuly!`,
        );
      case "rejected":
        // TODO
        toast.success(
          `Request: '${request.parent_partner_document_id}' was rejected!`,
        );
    }
  };
  return (
    <>
      <DropdownMenuItem
        disabled={request.request_status === "approved"}
        onClick={async () => await handleStatusChange("approved")}
      >
        Approve Request
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        disabled={
          request.request_status === "rejected" ||
          request.request_status === "approved"
        }
        onClick={async () => await handleStatusChange("rejected")}
      >
        Reject Request
      </DropdownMenuItem>
    </>
  );
};
