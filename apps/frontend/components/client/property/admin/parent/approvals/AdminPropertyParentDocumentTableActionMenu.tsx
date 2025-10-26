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
import { PropertyParentDocument } from "@/types/modules/compliance/model";
import { REQUEST_STATUS } from "@/types/modules/compliance/enum";

type AdminPropertyParentDocumentTableActionMenuProps = {
  jwt: string;
  adminId: string;
  request: PropertyParentDocument;
  setPropertyParentDocumentApprovalRequestStatus(
    jwt: string,
    propertyId: string,
    userId: string,
    parentDocumentId: string,
    requestStatus: REQUEST_STATUS,
  ): Promise<ApiResponse<PropertyParentDocument>>;
  getParentDocumentURLByDocumentID(
    jwt: string,
    docId: string,
  ): Promise<ApiResponse<string>>;
};

export default function AdminPropertyParentDocumentTableActionMenu({
  jwt,
  adminId,
  request,
  setPropertyParentDocumentApprovalRequestStatus,
  getParentDocumentURLByDocumentID,
}: AdminPropertyParentDocumentTableActionMenuProps) {
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
          setPropertyParentDocumentApprovalRequestStatus={
            setPropertyParentDocumentApprovalRequestStatus
          }
        />
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            const { data, error } = await getParentDocumentURLByDocumentID(
              jwt,
              request.parent_document_id,
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
  request: PropertyParentDocument;
  setPropertyParentDocumentApprovalRequestStatus(
    jwt: string,
    propertyId: string,
    userId: string,
    parentDocumentId: string,
    requestStatus: REQUEST_STATUS,
  ): Promise<ApiResponse<PropertyParentDocument>>;
};

const SetStatusDropdownMenuItem = ({
  jwt,
  request,
  setPropertyParentDocumentApprovalRequestStatus,
}: SetStatusDropdownMenuItemProps) => {
  const handleStatusChange = async (status: REQUEST_STATUS) => {
    const { error } = await setPropertyParentDocumentApprovalRequestStatus(
      jwt,
      request.property_id,
      request.user_id,
      request.parent_document_id,
      status,
    );
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Request ${status} successfuly!`);
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
