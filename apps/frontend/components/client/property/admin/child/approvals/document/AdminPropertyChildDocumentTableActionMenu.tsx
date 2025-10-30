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
import { useState } from "react";
import { RejectDocumentModal } from "./RejectDocumentModal";

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
  request,
  approvePropertyChildDocumentApprovalRequest,
  getChildDocumentURLByDocumentID,
}: AdminPropertyChildDocumentTableActionMenuProps) {
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<PropertyChildDocument | null>(null);

  const handleApproved = async () => {
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
  };

  const handleRejected = async (reason: string, req: PropertyChildDocument) => {
    // TODO
    toast.info(`Request: '${request.child_document_id}' rejected!`);
    alert(`Reason: ${reason}, ReqID: ${req.child_document_id}`);
  };
  return (
    <>
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
            request={request}
            onApprove={handleApproved}
            onReject={(req) => {
              setSelectedRequest(req);
              setIsRejectModalOpen(true);
            }}
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
      <RejectDocumentModal
        open={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onSubmit={async (reason) => {
          if (!selectedRequest) return;
          await handleRejected(reason, selectedRequest);
          setIsRejectModalOpen(false);
        }}
      />
    </>
  );
}

type SetStatusDropdownMenuItemProps = {
  request: PropertyChildDocument;
  onApprove: () => void;
  onReject: (request: PropertyChildDocument) => void;
};

const SetStatusDropdownMenuItem = ({
  request,
  onApprove,
  onReject,
}: SetStatusDropdownMenuItemProps) => {
  return (
    <>
      <DropdownMenuItem
        disabled={request.request_status === "approved"}
        onClick={onApprove}
      >
        Approve Request
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        disabled={
          request.request_status === "rejected" ||
          request.request_status === "approved"
        }
        onClick={() => onReject(request)}
      >
        Reject Request
      </DropdownMenuItem>
    </>
  );
};
