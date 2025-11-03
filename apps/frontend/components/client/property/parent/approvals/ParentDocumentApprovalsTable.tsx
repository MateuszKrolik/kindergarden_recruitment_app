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
import { PropertyParentDocument } from "@/types/modules/compliance/model";

type ParentDocumentApprovalsTableProps = {
  jwt: string;
  propertyId: string;
  userId: string;
  getAllDocumentApprovalRequestsForGivenPropertyParent(
    jwt: string,
    propertyId: string,
    userId: string,
  ): Promise<ApiResponse<PropertyParentDocument[]>>;
};

export const ParentDocumentApprovalsTable = ({
  jwt,
  propertyId,
  userId,
  getAllDocumentApprovalRequestsForGivenPropertyParent,
}: ParentDocumentApprovalsTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Array<PropertyParentDocument>>([]);

  const columns: ColumnDef<PropertyParentDocument>[] = [
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
    const rejectionReasonColumn: ColumnDef<PropertyParentDocument> = {
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
      await getAllDocumentApprovalRequestsForGivenPropertyParent(
        jwt,
        propertyId,
        userId,
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
    userId,
    getAllDocumentApprovalRequestsForGivenPropertyParent,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    function onRequestUpdated(event: PropertyParentDocument) {
      setData((prev) => {
        const existingIndex = prev.findIndex(
          (doc) => doc.parent_document_id === event.parent_document_id,
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

    function onRequestSent(event: PropertyParentDocument) {
      setData((prev) => [...prev, event]);
      toast.success(
        `Document: ${event.parent_document_id} was just sent for approval!`,
      );
    }

    socket.on(
      COMPLIANCE_EVENTS.PROPERTY_PARENT_DOCUMENT_UPDATED,
      onRequestUpdated,
    );

    socket.on(
      COMPLIANCE_EVENTS.PROPERTY_PARENT_DOCUMENT_REQUESTED,
      onRequestSent,
    );

    return () => {
      socket.off(
        COMPLIANCE_EVENTS.PROPERTY_PARENT_DOCUMENT_UPDATED,
        onRequestUpdated,
      );
      socket.off(
        COMPLIANCE_EVENTS.PROPERTY_PARENT_DOCUMENT_REQUESTED,
        onRequestSent,
      );
    };
  }, []);

  const table = useReactTable<PropertyParentDocument>({
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
