"use client";

import { PropertyChildDocument } from "shared/types/modules/compliance";
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
import { COMPLIANCE_EVENTS } from "shared/events/modules/compliance";
import socket from "@/app/socket";
import { EventEnvelope } from "shared/types/event";
import { ApiResponse } from "shared/types/response";

type ParentChildDocumentApprovalsTableProps = {
  jwt: string;
  propertyId: string;
  childId: string;
  getAllDocumentApprovalRequestsForGivenPropertyChild(
    jwt: string,
    propertyId: string,
    childId: string,
  ): ApiResponse<PropertyChildDocument[]>;
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
  const [data, setData] = useState<PropertyChildDocument[]>([]);

  const columns: ColumnDef<PropertyChildDocument>[] = [
    {
      accessorKey: "child_document_id",
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
        <div className="lowercase">{row.getValue("child_document_id")}</div>
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

    if (!result) {
      toast.error(`Error: No data available!`);
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
    function onRequestApproved(event: EventEnvelope<PropertyChildDocument>) {
      setData((prev) => {
        const existingIndex = prev.findIndex(
          (doc) => doc.child_document_id === event.payload.child_document_id,
        );

        if (existingIndex !== -1) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            request_status: event.payload.request_status,
            approved_by: event.payload.approved_by,
          };
          return updated;
        }

        return prev;
      });

      toast.success(
        `Document: ${event.payload.child_document_id} was just approved! 🎉`,
      );
    }

    function onRequestSent(event: PropertyChildDocument) {
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

  const table = useReactTable<PropertyChildDocument>({
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
