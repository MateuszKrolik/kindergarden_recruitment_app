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
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { Progress } from "../ui/progress";
import { ApiResponse } from "@/types/response";
import { components } from "@/client/schema";

type PropertyTableRowActionMenuContentProps = {
  jwt: string;
  propertyId: string;
  userId: string;
  getPropertyUser(
    jwt: string,
    propertyId: string,
    userId: string,
  ): Promise<ApiResponse<components["schemas"]["PropertyUser"]>>;
};

export const PropertyTableRowActionMenu = ({
  jwt,
  propertyId,
  userId,
  getPropertyUser,
}: PropertyTableRowActionMenuContentProps) => {
  const [propertyUser, setPropertyUser] = useState<
    components["schemas"]["PropertyUser"] | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleOnOpenChange = async (open: boolean) => {
    if (open) {
      setIsLoading(true);
      const { data, error } = await getPropertyUser(jwt, propertyId, userId);
      if (error) {
        if (error.code === 404) {
          setIsLoading(false);
          return;
        }
        toast.error(error.message);
        setIsLoading(false);
        return;
      }
      setPropertyUser(data);
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
