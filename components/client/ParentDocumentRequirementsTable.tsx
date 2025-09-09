"use client";

import { PropertyParentDocumentRequirement } from "@/data-access-layer/modules/property-management/model";
import { getErrorMessage } from "@/util/error";
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
import { ParentDocument } from "@/data-access-layer/modules/reporting/model";
import { DocumentType } from "@/data-access-layer/shared/types/reporting";
import { ParentDocumentRequirementsTableActionMenu } from "./ParentDocumentRequirementsTableActionMenu";
import { PropertyParentDocument } from "@/data-access-layer/modules/compliance/model";

export type ParentDocumentRequirementsTableProps = {
  propertyId: string;
  userId: string;
  getPropertyParentDocumentRequirements(
    propertyId: string,
    userId: string,
  ): Promise<{ data?: PropertyParentDocumentRequirement[]; error?: Error }>;
  getParentDocumentByType(
    userId: string,
    documentType: DocumentType,
  ): Promise<{ data?: ParentDocument; error?: Error }>;
  getPropertyParentDocumentApprovalRequestByDocumentId(
    propertyId: string,
    userId: string,
    parentDocId: string,
  ): Promise<{ data?: PropertyParentDocument; error?: Error }>;
  sendPropertyParentDocumentApprovalRequest(
    propertyId: string,
    userId: string,
    parentDocumentId: string,
  ): Promise<{ data?: PropertyParentDocument; error?: Error }>;
  revalidateGetAllDocumentApprovalRequestsForGivenPropertyParentCacheTag(
    propertyId: string,
    userId: string,
  ): Promise<void>;
  revalidateGetPropertyParentDocumentApprovalRequestCacheTag(
    propertyId: string,
    userId: string,
    parentDocumentId: string,
  ): Promise<void>;
  revalidateGetAllDocumentApprovalRequestsForGivenPropertyCacheTag(
    propertyId: string,
  ): Promise<void>;
};

export const ParentDocumentRequirementsTable = ({
  propertyId,
  userId,
  getPropertyParentDocumentRequirements,
  getParentDocumentByType,
  getPropertyParentDocumentApprovalRequestByDocumentId,
  sendPropertyParentDocumentApprovalRequest,
  revalidateGetAllDocumentApprovalRequestsForGivenPropertyParentCacheTag,
  revalidateGetPropertyParentDocumentApprovalRequestCacheTag,
  revalidateGetAllDocumentApprovalRequestsForGivenPropertyCacheTag,
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
            revalidateGetAllDocumentApprovalRequestsForGivenPropertyParentCacheTag={
              revalidateGetAllDocumentApprovalRequestsForGivenPropertyParentCacheTag
            }
            revalidateGetPropertyParentDocumentApprovalRequestCacheTag={
              revalidateGetPropertyParentDocumentApprovalRequestCacheTag
            }
            revalidateGetAllDocumentApprovalRequestsForGivenPropertyCacheTag={
              revalidateGetAllDocumentApprovalRequestsForGivenPropertyCacheTag
            }
          />
        );
      },
    },
  ];

  const fetchData = useCallback(async () => {
    const { data, error } = await getPropertyParentDocumentRequirements(
      propertyId,
      userId,
    );

    if (error) {
      const errMsg = getErrorMessage(error);
      toast.error(`Error: ${errMsg}`);
      setError(errMsg);
      return;
    }

    if (!data) {
      toast.error(`Error: No data available!`);
      return;
    }

    setData(data);
  }, [propertyId, userId, getPropertyParentDocumentRequirements]);

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
