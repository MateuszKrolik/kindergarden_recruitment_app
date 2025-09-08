"use client";

import { PropertyParentDocument } from "@/data-access-layer/modules/compliance/model";
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
import { useCallback, useEffect, useState } from "react";
import { Button } from "../ui/button";
import { ArrowUpDown } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/util/error";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

type ParentDocumentApprovalsTableProps = {
  propertyId: string;
  userId: string;
  getPropertyParentDocumentApprovalRequests(
    propertyId: string,
    userId: string,
  ): Promise<{ data?: PropertyParentDocument[]; error?: Error }>;
};

export const ParentDocumentApprovalsTable = ({
  propertyId,
  userId,
  getPropertyParentDocumentApprovalRequests,
}: ParentDocumentApprovalsTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PropertyParentDocument[]>([]);

  const columns: ColumnDef<PropertyParentDocument>[] = [
    {
      accessorKey: "parent_document_id",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Parent Document ID
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("parent_document_id")}</div>
      ),
    },
    {
      accessorKey: "request_status",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Request Status
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("request_status")}</div>
      ),
    },
    {
      accessorKey: "approved_by",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Approved By ID
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("approved_by")}</div>
      ),
    },
  ];

  const fetchData = useCallback(async () => {
    const { data: result, error } =
      await getPropertyParentDocumentApprovalRequests(propertyId, userId);

    if (error) {
      const errMsg = getErrorMessage(error);
      toast.error(`Error: ${errMsg}`);
      setError(errMsg);
      return;
    }

    if (!result) {
      toast.error(`Error: No data available!`);
      return;
    }

    setData(result);
  }, [propertyId, userId, getPropertyParentDocumentApprovalRequests]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const table = useReactTable<PropertyParentDocument>({
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
