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
import { PropertyUser } from "@/types/property";
import { useState } from "react";
import { toast } from "sonner";

type PropertyTableRowActionMenuContentProps = {
  propertyId: string;
  getPropertyUserMeMenuAction(
    propertyId: string,
  ): Promise<{ data: PropertyUser | null; error: string | null }>;
};

export const PropertyTableRowActionMenu = ({
  propertyId,
  getPropertyUserMeMenuAction,
}: PropertyTableRowActionMenuContentProps) => {
  const [propertyUser, setPropertyUser] = useState<PropertyUser | null>(null);

  const handleOnOpenChange = async (open: boolean) => {
    if (open) {
      const { data, error } = await getPropertyUserMeMenuAction(propertyId);
      if (error) {
        toast.error(error);
        return;
      }
      console.log(data);
      setPropertyUser(data);
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
        {propertyUser ? (
          <DropdownMenuItem>Go to property</DropdownMenuItem>
        ) : (
          <DropdownMenuItem>Register to property</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
