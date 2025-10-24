"use client";

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { COMPLIANCE_EVENTS } from "@/socket/events/modules/compliance";
import socket from "@/socket";
import { ApiResponse } from "@/types/response";
import { components } from "@/client/schema";

type ParentChildDocumentApprovalsTableProps = {
  jwt: string;
  propertyId: string;
  childId: string;
  getAllDocumentApprovalRequestsForGivenPropertyChild(
    jwt: string,
    propertyId: string,
    childId: string,
  ): Promise<ApiResponse<components["schemas"]["PropertyChildDocument"][]>>;
};

export const ParentChildDocumentApprovalsTable = ({
  jwt,
  propertyId,
  childId,
  getAllDocumentApprovalRequestsForGivenPropertyChild,
}: ParentChildDocumentApprovalsTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<
    components["schemas"]["PropertyChildDocument"][]
  >([]);

  const columns: ColumnDef<components["schemas"]["PropertyChildDocument"]>[] = [
    {
      accessorKey: "childDocumentId",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Child Document ID
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("childDocumentId")}</div>
      ),
    },
    {
      accessorKey: "requestStatus",
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
        <div className="lowercase">{row.getValue("requestStatus")}</div>
      ),
    },
    {
      accessorKey: "approvedBy",
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
        <div className="lowercase">{row.getValue("approvedBy")}</div>
      ),
    },
  ];

  const fetchData = useCallback(async () => {
    const { data: result, error } =
      await getAllDocumentApprovalRequestsForGivenPropertyChild(
        jwt,
        propertyId,
        childId,
      );

    if (error) {
      const errMsg = error.message;
      toast.error(`Error: ${errMsg}`);
      setError(errMsg);
      return;
    }

    setData(result);
  }, [
    jwt,
    propertyId,
    childId,
    getAllDocumentApprovalRequestsForGivenPropertyChild,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    function onRequestApproved(
      event: components["schemas"]["PropertyChildDocument"],
    ) {
      setData((prev) => {
        const existingIndex = prev.findIndex(
          (doc) => doc.child_document_id === event.child_document_id,
        );

        if (existingIndex !== -1) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            request_status: event.request_status,
            approved_by: event.approved_by,
          };
          return updated;
        }

        return prev;
      });

      toast.success(
        `Document: ${event.child_document_id} was just approved! 🎉`,
      );
    }

    function onRequestSent(
      event: components["schemas"]["PropertyChildDocument"],
    ) {
      setData((prev) => [...prev, event]);
    }

    socket.on(
      COMPLIANCE_EVENTS.PROPERTY_PARENT_DOCUMENT_APPROVED,
      onRequestApproved,
    );

    socket.on(
      COMPLIANCE_EVENTS.PROPERTY_PARENT_DOCUMENT_REQUESTED,
      onRequestSent,
    );

    return () => {
      socket.off(
        COMPLIANCE_EVENTS.PROPERTY_PARENT_DOCUMENT_APPROVED,
        onRequestApproved,
      );
      socket.off(
        COMPLIANCE_EVENTS.PROPERTY_PARENT_DOCUMENT_REQUESTED,
        onRequestSent,
      );
    };
  }, []);

  const table = useReactTable<components["schemas"]["PropertyChildDocument"]>({
    data: error ? [] : data,
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
