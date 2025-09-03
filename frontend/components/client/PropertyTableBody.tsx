"use client";
import { useEffect } from "react";
import { toast } from "sonner";
import { TableBody, TableCell, TableRow } from "../ui/table";
import { PropertyTableProps } from "../server/PropertyTable";

export const PropertyTableBody = ({ data, error }: PropertyTableProps) => {
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);
  return (
    <TableBody>
      {data?.items.map((val, idx) => {
        return (
          <TableRow key={idx}>
            <TableCell className="font-medium px-4">{val?.id}</TableCell>
            <TableCell className="text-right px-4">{val?.name}</TableCell>
          </TableRow>
        );
      })}
    </TableBody>
  );
};
