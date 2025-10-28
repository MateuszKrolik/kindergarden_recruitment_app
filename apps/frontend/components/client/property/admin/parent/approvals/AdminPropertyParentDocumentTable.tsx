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
import { ArrowUpDown, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { formPageResizeUrl, formTargetPageUrl } from "@/util/pagination";
import AdminPropertyParentDocumentTableActionMenu from "./AdminPropertyParentDocumentTableActionMenu";
import { COMPLIANCE_EVENTS } from "@/socket/events/modules/compliance";
import socket from "@/socket";
import { ApiResponse } from "@/types/response";
import {
  PagedResponse_PropertyParentDocument,
  PropertyParentDocument,
} from "@/types/modules/compliance/model";
import { REQUEST_STATUS } from "@/types/modules/compliance/enum";

interface AdminPropertyParentDocumentTableProps {
  jwt: string;
  propertyId: string;
  adminId: string;
  getAllDocumentApprovalRequestsForGivenProperty(
    jwt: string,
    propertyId: string,
    pageSize: number,
    pageNumber: number,
  ): Promise<ApiResponse<PagedResponse_PropertyParentDocument>>;
  setPropertyParentDocumentApprovalRequestStatus(
    jwt: string,
    propertyId: string,
    userId: string,
    parentDocumentId: string,
    requestStatus: REQUEST_STATUS,
  ): Promise<ApiResponse<PropertyParentDocument>>;
  getParentDocumentURLByDocumentID(
    jwt: string,
    docId: string,
  ): Promise<ApiResponse<string>>;
}

export default function AdminPropertyParentDocumentTable({
  jwt,
  propertyId,
  adminId,
  getAllDocumentApprovalRequestsForGivenProperty,
  setPropertyParentDocumentApprovalRequestStatus,
  getParentDocumentURLByDocumentID,
}: AdminPropertyParentDocumentTableProps) {
  const searchParams = useSearchParams();
  const pageNumberParam = searchParams.get("pageNumber");
  const pageNumber = parseInt(pageNumberParam || "1");
  const pageSizeParam = searchParams.get("pageSize");
  const pageSize = parseInt(pageSizeParam || "1");
  const [result, setResult] = useState<Array<PropertyParentDocument>>([]);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [hasPreviousPage, setHasPreviousPage] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [totalPages, setTotalPages] = useState<number>(1);

  const loadProperties = useCallback(
    async (size: number, pageNumber: number) => {
      setIsLoading(true);
      const { data: result, error } =
        await getAllDocumentApprovalRequestsForGivenProperty(
          jwt,
          propertyId,
          size,
          pageNumber,
        );
      if (error) {
        toast.error(error.message);
        setIsLoading(false);
        return;
      }

      setResult(result.items);
      setTotalCount(result.total);
      setHasNextPage(result.has_next_page);
      setHasPreviousPage(result.has_previous_page);
      setTotalPages(result.total_pages);
      setIsLoading(false);
    },
    [jwt, propertyId, getAllDocumentApprovalRequestsForGivenProperty],
  );

  const columns: ColumnDef<PropertyParentDocument>[] = [
    {
      accessorKey: "user_id",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Parent User ID
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("user_id")}</div>
      ),
    },
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
      accessorKey: "approved_by",
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
        <div className="lowercase">{row.getValue("approved_by")}</div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const request = row.original;

        return (
          <AdminPropertyParentDocumentTableActionMenu
            jwt={jwt}
            adminId={adminId}
            request={request}
            setPropertyParentDocumentApprovalRequestStatus={
              setPropertyParentDocumentApprovalRequestStatus
            }
            getParentDocumentURLByDocumentID={getParentDocumentURLByDocumentID}
          />
        );
      },
    },
  ];

  const table = useReactTable<PropertyParentDocument>({
    data: result,
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

  useEffect(() => {
    loadProperties(pageSize, pageNumber);
  }, [loadProperties, pageNumber, pageSize]);

  useEffect(() => {
    function onRequestApproved(event: PropertyParentDocument) {
      setResult((prev) => {
        const existingIndex = prev.findIndex(
          (doc) => doc.parent_document_id === event.parent_document_id,
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
        `Document: ${event.parent_document_id} was just approved! 🎉`,
      );
    }

    function onRequestSent(event: PropertyParentDocument) {
      setResult((prev) => [...prev, event]);
      toast.success(
        `Document: ${event.parent_document_id} was just sent for approval!`,
      );
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
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length}>Loading...</TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
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
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          Page {pageNumber} of {totalPages} • {totalCount} total items
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Page size: {pageSize} <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Rows per page</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {[1, 2].map((size) => (
              <DropdownMenuItem key={size} asChild>
                <Link key={size} href={formPageResizeUrl(size)}>
                  {size}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!hasPreviousPage || isLoading}
            asChild={hasPreviousPage && !isLoading}
          >
            {hasPreviousPage && !isLoading ? (
              <Link href={formTargetPageUrl(pageNumber - 1, pageSize)}>
                Previous
              </Link>
            ) : (
              <span>Previous</span>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasNextPage || isLoading}
            asChild={hasNextPage && !isLoading}
          >
            {hasNextPage && !isLoading ? (
              <Link href={formTargetPageUrl(pageNumber + 1, pageSize)}>
                Next
              </Link>
            ) : (
              <span>Next</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
