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
import { PropertyParentDocumentRequirement } from "@/data-access-layer/modules/property-management/model";
import { ParentDocument } from "@/data-access-layer/modules/reporting/model";
import { DocumentType } from "@/data-access-layer/modules/shared/types/reporting";
import { useState } from "react";
import { toast } from "sonner";
import { getErrorMessage } from "@/util/error";

type ParentDocumentRequirementsTableActionMenuProps = {
  userId: string;
  requirement: PropertyParentDocumentRequirement;
  getParentDocumentByType(
    userId: string,
    documentType: DocumentType,
  ): Promise<ParentDocument | Error>;
};

export const ParentDocumentRequirementsTableActionMenu = ({
  userId,
  requirement,
  getParentDocumentByType,
}: ParentDocumentRequirementsTableActionMenuProps) => {
  const [parentDoc, setParentDoc] = useState<ParentDocument | null>(null);

  const handleOnOpenChange = async (open: boolean) => {
    if (open) {
      const result = await getParentDocumentByType(
        userId,
        requirement.document_type,
      );
      if (result instanceof Error) {
        toast.error(getErrorMessage(result));
        return;
      }
      console.log(result);
      setParentDoc(result);
    }
  };
  return (
    <DropdownMenu onOpenChange={handleOnOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        {parentDoc ? (
          <DropdownMenuItem
            onClick={() =>
              navigator.clipboard.writeText(requirement.document_type)
            }
          >
            Request approval
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={() =>
              navigator.clipboard.writeText(requirement.document_type)
            }
          >
            Upload document
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem>TODO</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
