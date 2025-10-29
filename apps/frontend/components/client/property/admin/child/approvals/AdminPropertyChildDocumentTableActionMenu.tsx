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
import { PropertyChildDocument } from "@/types/modules/compliance/model";
import { REQUEST_STATUS } from "@/types/modules/compliance/enum";

type AdminPropertyChildDocumentTableActionMenuProps = {
  jwt: string;
  adminId: string;
  request: PropertyChildDocument;
  approvePropertyChildDocumentApprovalRequest(
    jwt: string,
    propertyId: string,
    childId: string,
    childDocumentId: string,
  ): Promise<ApiResponse<PropertyChildDocument>>;
  getChildDocumentURLByDocumentID(
    jwt: string,
    documentId: string,
  ): Promise<ApiResponse<string>>;
};

export default function AdminPropertyChildDocumentTableActionMenu({
  jwt,
  adminId,
  request,
  approvePropertyChildDocumentApprovalRequest,
  getChildDocumentURLByDocumentID,
}: AdminPropertyChildDocumentTableActionMenuProps) {
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
          approvePropertyChildDocumentApprovalRequest={
            approvePropertyChildDocumentApprovalRequest
          }
        />
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            const { data, error } = await getChildDocumentURLByDocumentID(
              jwt,
              request.child_document_id,
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
  request: PropertyChildDocument;
  approvePropertyChildDocumentApprovalRequest(
    jwt: string,
    propertyId: string,
    childId: string,
    childDocumentId: string,
  ): Promise<ApiResponse<PropertyChildDocument>>;
};

const SetStatusDropdownMenuItem = ({
  jwt,
  request,
  approvePropertyChildDocumentApprovalRequest,
}: SetStatusDropdownMenuItemProps) => {
  const handleStatusChange = async (status: REQUEST_STATUS) => {
    switch (status) {
      case "approved":
        const { error } = await approvePropertyChildDocumentApprovalRequest(
          jwt,
          request.property_id,
          request.child_id,
          request.child_document_id,
        );
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success(
          `Request: '${request.child_document_id}' approved successfuly!`,
        );
      case "rejected":
        // TODO
        toast.success(`Request: '${request.child_document_id}' rejected!`);
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
