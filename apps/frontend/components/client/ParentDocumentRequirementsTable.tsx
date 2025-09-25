"use client";

import { toast } from "sonner";
import { Button } from "../ui/button";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useCallback, useEffect, useState } from "react";
import { DocumentType, ParentDocument } from "shared/types/modules/reporting";
import { ParentDocumentRequirementsTableActionMenu } from "./ParentDocumentRequirementsTableActionMenu";
import { PropertyParentDocument } from "shared/types/modules/compliance";
import { ApiResponse } from "shared/types/response";
import { PropertyParentDocumentRequirement } from "shared/types/modules/property-management";

export type ParentDocumentRequirementsTableProps = {
  jwt: string;
  propertyId: string;
  userId: string;
  getPropertyParentDocumentRequirements(
    jwt: string,
    propertyId: string,
    userId: string,
  ): ApiResponse<PropertyParentDocumentRequirement[]>;
  getParentDocumentByType(
    jwt: string,
    userId: string,
    documentType: DocumentType,
  ): ApiResponse<ParentDocument>;
  getPropertyParentDocumentApprovalRequestByDocumentId(
    jwt: string,
    propertyId: string,
    userId: string,
    parentDocId: string,
  ): ApiResponse<PropertyParentDocument>;
  sendPropertyParentDocumentApprovalRequest(
    jwt: string,
    propertyId: string,
    userId: string,
    parentDocumentId: string,
  ): ApiResponse<PropertyParentDocument>;
  saveParentDocument(
    jwt: string,
    userId: string,
    documentType: DocumentType,
    file: File,
  ): ApiResponse<ParentDocument>;
  getDocumentURLByFilePath(jwt: string, key: string): ApiResponse<string>;
};

export const ParentDocumentRequirementsTable = ({
  jwt,
  propertyId,
  userId,
  getPropertyParentDocumentRequirements,
  getParentDocumentByType,
  getPropertyParentDocumentApprovalRequestByDocumentId,
  sendPropertyParentDocumentApprovalRequest,
  saveParentDocument,
  getDocumentURLByFilePath,
}: ParentDocumentRequirementsTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PropertyParentDocumentRequirement[]>([]);

  const columns: ColumnDef<PropertyParentDocumentRequirement>[] = [
    {
      accessorKey: "document_type",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Document Type
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("document_type")}</div>
      ),
    },
    {
      accessorKey: "requirement_type",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Requirement Type
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("requirement_type")}</div>
      ),
    },
    {
      accessorKey: "condition_key",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Condition Key
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("condition_key")}</div>
      ),
    },
    {
      accessorKey: "point_value",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Point Value
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("point_value")}</div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const requirement = row.original;
        return (
          <ParentDocumentRequirementsTableActionMenu
            jwt={jwt}
            propertyId={propertyId}
            userId={userId}
            getParentDocumentByType={getParentDocumentByType}
            requirement={requirement}
            getPropertyParentDocumentApprovalRequestByDocumentId={
              getPropertyParentDocumentApprovalRequestByDocumentId
            }
            sendPropertyParentDocumentApprovalRequest={
              sendPropertyParentDocumentApprovalRequest
            }
            saveParentDocument={saveParentDocument}
            getDocumentURLByFilePath={getDocumentURLByFilePath}
          />
        );
      },
    },
  ];

  const fetchData = useCallback(async () => {
    const { data, error } = await getPropertyParentDocumentRequirements(
      jwt,
      propertyId,
      userId,
    );

    if (error) {
      const errMsg = error.message;
      toast.error(errMsg);
      setError(errMsg);
      return;
    }

    setData(data);
  }, [jwt, propertyId, userId, getPropertyParentDocumentRequirements]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const table = useReactTable<PropertyParentDocumentRequirement>({
    data: error || data instanceof Error ? [] : data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full max-w-4xl">
      <div className="flex items-center py-4"></div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
