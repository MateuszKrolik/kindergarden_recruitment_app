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
import { RejectRequestBody } from "@/types/modules/compliance/dto";
import { useState } from "react";
import { RejectDocumentModal } from "../../child/approvals/RejectDocumentModal";

type AdminPropertyParentDocumentTableActionMenuProps = {
  jwt: string;
  request: PropertyParentDocument;
  approvePropertyParentDocumentApprovalRequest(
    jwt: string,
    propertyId: string,
    userId: string,
    parentDocumentId: string,
  ): Promise<ApiResponse<PropertyParentDocument>>;
  getParentDocumentURLByDocumentID(
    jwt: string,
    docId: string,
  ): Promise<ApiResponse<string>>;
  rejectPropertyParentDocumentApprovalRequest(
    jwt: string,
    propertyId: string,
    parentId: string,
    parentDocumentId: string,
    body: RejectRequestBody,
  ): Promise<ApiResponse<PropertyParentDocument>>;
};

export default function AdminPropertyParentDocumentTableActionMenu({
  jwt,
  request,
  approvePropertyParentDocumentApprovalRequest,
  getParentDocumentURLByDocumentID,
  rejectPropertyParentDocumentApprovalRequest,
}: AdminPropertyParentDocumentTableActionMenuProps) {
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<PropertyParentDocument | null>(null);

  const handleApproved = async () => {
    const { error } = await approvePropertyParentDocumentApprovalRequest(
      jwt,
      request.property_id,
      request.user_id,
      request.parent_document_id,
    );
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(
      `Request: '${request.parent_document_id}' approved successfuly!`,
    );
  };

  const handleRejected = async (
    reason: string,
    req: PropertyParentDocument,
  ) => {
    const { error } = await rejectPropertyParentDocumentApprovalRequest(
      jwt,
      req.property_id,
      req.user_id,
      req.parent_document_id,
      {
        rejection_reason: reason,
      },
    );
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.info(
      `Request: '${request.parent_document_id}' rejected succesfully!`,
    );
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
  request: PropertyParentDocument;
  onApprove: () => void;
  onReject: (request: PropertyParentDocument) => void;
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
