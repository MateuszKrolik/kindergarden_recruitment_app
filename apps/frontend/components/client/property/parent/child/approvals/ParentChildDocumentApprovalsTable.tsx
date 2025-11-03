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
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { COMPLIANCE_EVENTS } from "@/socket/events/modules/compliance";
import socket from "@/socket";
import { ApiResponse } from "@/types/response";
import { PropertyChildDocument } from "@/types/modules/compliance/model";

type ParentChildDocumentApprovalsTableProps = {
  jwt: string;
  propertyId: string;
  childId: string;
  getAllDocumentApprovalRequestsForGivenPropertyChild(
    jwt: string,
    propertyId: string,
    childId: string,
  ): Promise<ApiResponse<PropertyChildDocument[]>>;
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
      accessorKey: "approved_by_name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Approved By
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("approved_by_name")}</div>
      ),
    },
  ];

  if (data.some((row) => row.request_status === "rejected")) {
    const rejectionReasonColumn: ColumnDef<PropertyChildDocument> = {
      accessorKey: "rejection_reason",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Rejection Reason
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("rejection_reason")}</div>
      ),
    };
    columns.splice(columns.length - 1, 0, rejectionReasonColumn);
  }

  const fetchData = useCallback(async () => {
    const { data: result, error } =
      await getAllDocumentApprovalRequestsForGivenPropertyChild(
        jwt,
        propertyId,
        childId,
      );

    if (error) {
      if (error.code === 404) {
        setData([]);
        setError(null);
        return;
      }
      const errMsg = error.message;
      toast.error(errMsg);
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
    function onRequestUpdated(event: PropertyChildDocument) {
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
            approved_by_name: event.approved_by_name,
            approved_by_email: event.approved_by_email,
            rejection_reason: event.rejection_reason,
          };
          return updated;
        }

        return prev;
      });

      switch (event.request_status) {
        case "approved":
          toast.success(
            `Document: ${event.document_type} was just approved! 🎉`,
          );
        case "rejected":
          toast.info(`Document: ${event.document_type} was just rejected.`);
      }
    }

    function onRequestSent(event: PropertyChildDocument) {
      setData((prev) => [...prev, event]);
    }

    socket.on(
      COMPLIANCE_EVENTS.PROPERTY_CHILD_DOCUMENT_UPDATED,
      onRequestUpdated,
    );

    socket.on(
      COMPLIANCE_EVENTS.PROPERTY_CHILD_DOCUMENT_REQUESTED,
      onRequestSent,
    );

    return () => {
      socket.off(
        COMPLIANCE_EVENTS.PROPERTY_CHILD_DOCUMENT_UPDATED,
        onRequestUpdated,
      );
      socket.off(
        COMPLIANCE_EVENTS.PROPERTY_CHILD_DOCUMENT_REQUESTED,
        onRequestSent,
      );
    };
  }, []);

  const table = useReactTable<PropertyChildDocument>({
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
