"use client";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { PropertyUser } from "@/data-access-layer/modules/property-management/model";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { getErrorMessage } from "@/util/error";
import { Progress } from "../ui/progress";

type PropertyTableRowActionMenuContentProps = {
  propertyId: string;
  userId: string;
  getPropertyUser(
    propertyId: string,
    userId: string,
  ): Promise<{ data?: PropertyUser; error?: Error }>;
};

export const PropertyTableRowActionMenu = ({
  propertyId,
  userId,
  getPropertyUser,
}: PropertyTableRowActionMenuContentProps) => {
  const [propertyUser, setPropertyUser] = useState<PropertyUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleOnOpenChange = async (open: boolean) => {
    if (open) {
      setIsLoading(true);
      const { data: result, error } = await getPropertyUser(propertyId, userId);
      if (error) {
        toast.error(getErrorMessage(result));
        setIsLoading(false);
        return;
      }
      if (!result) {
        setIsLoading(false);
        return;
      }
      console.log(result);
      setPropertyUser(result);
      setIsLoading(false);
    } else {
      setIsLoading(false);
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
        {isLoading ? (
          <DropdownMenuItem>
            <Progress value={33} />
          </DropdownMenuItem>
        ) : propertyUser ? (
          <DropdownMenuItem asChild>
            <Link
              href={`/dashboard/properties/${propertyId}/${propertyUser.role}`}
            >
              Go to property
            </Link>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem>Register to property</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
