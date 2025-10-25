import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { ApiResponse } from "@/types/response";
import { PropertyChildDocument } from "@/types/modules/compliance/model";
import { REQUEST_STATUS } from "@/types/modules/compliance/enum";

type AdminPropertyChildDocumentTableActionMenuProps = {
  jwt: string;
  adminId: string;
  request: PropertyChildDocument;
  setPropertyChildDocumentApprovalRequestStatus(
    jwt: string,
    propertyId: string,
    childId: string,
    childDocumentId: string,
    requestStatus: REQUEST_STATUS,
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
  setPropertyChildDocumentApprovalRequestStatus,
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
          setPropertyChildDocumentApprovalRequestStatus={
            setPropertyChildDocumentApprovalRequestStatus
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
  setPropertyChildDocumentApprovalRequestStatus(
    jwt: string,
    propertyId: string,
    childId: string,
    childDocumentId: string,
    requestStatus: REQUEST_STATUS,
  ): Promise<ApiResponse<PropertyChildDocument>>;
};

const SetStatusDropdownMenuItem = ({
  jwt,
  request,
  setPropertyChildDocumentApprovalRequestStatus,
}: SetStatusDropdownMenuItemProps) => {
  const handleStatusChange = async (status: REQUEST_STATUS) => {
    const { error } = await setPropertyChildDocumentApprovalRequestStatus(
      jwt,
      request.property_id,
      request.child_id,
      request.child_document_id,
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
