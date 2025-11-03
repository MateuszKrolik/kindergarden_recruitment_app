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
import { RejectRequestBody } from "@/types/modules/compliance/dto";
import { useState } from "react";
import { RejectDocumentModal } from "../../child/approvals/RejectDocumentModal";

type AdminPropertyParentPartnerDocumentTableActionMenuProps = {
  jwt: string;
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
  rejectPropertyParentPartnerDocumentApprovalRequest(
    jwt: string,
    propertyId: string,
    partnerId: string,
    parentPartnerDocumentId: string,
    body: RejectRequestBody,
  ): Promise<ApiResponse<PropertyParentPartnerDocument>>;
};

export default function AdminPropertyParentPartnerDocumentTableActionMenu({
  jwt,
  request,
  approvePropertyParentPartnerDocumentApprovalRequest,
  getParentPartnerDocumentURLByDocumentID,
  rejectPropertyParentPartnerDocumentApprovalRequest,
}: AdminPropertyParentPartnerDocumentTableActionMenuProps) {
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<PropertyParentPartnerDocument | null>(null);

  const handleApproved = async () => {
    const { error } = await approvePropertyParentPartnerDocumentApprovalRequest(
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
  };

  const handleRejected = async (
    reason: string,
    req: PropertyParentPartnerDocument,
  ) => {
    const { error } = await rejectPropertyParentPartnerDocumentApprovalRequest(
      jwt,
      req.property_id,
      req.partner_id,
      req.parent_partner_document_id,
      {
        rejection_reason: reason,
      },
    );
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.info(
      `Request: '${request.parent_partner_document_id}' rejected succesfully!`,
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
  request: PropertyParentPartnerDocument;
  onApprove: () => void;
  onReject: (request: PropertyParentPartnerDocument) => void;
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
