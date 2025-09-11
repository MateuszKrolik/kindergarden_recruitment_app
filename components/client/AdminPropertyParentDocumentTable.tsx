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
import { PagedResponse } from "@/types/pagination";
import { toast } from "sonner";
import { getErrorMessage } from "@/util/error";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { formPageResizeUrl, formTargetPageUrl } from "@/util/pagination";
import {
  PropertyParentDocument,
  RequestStatus,
} from "@/data-access-layer/modules/compliance/model";
import AdminPropertyParentDocumentTableActionMenu from "./AdminPropertyParentDocumentTableActionMenu";

interface AdminPropertyParentDocumentTableProps {
  propertyId: string;
  adminId: string;
  getAllDocumentApprovalRequestsForGivenProperty(
    propertyId: string,
    pageSize: number,
    pageNumber: number,
  ): Promise<{ data?: PagedResponse<PropertyParentDocument>; error?: Error }>;
  setPropertyParentDocumentApprovalRequestStatus(
    propertyId: string,
    userId: string,
    parentDocumentId: string,
    requestStatus: RequestStatus,
    adminId: string,
  ): Promise<{ data?: PropertyParentDocument; error?: Error }>;
}

export default function AdminPropertyParentDocumentTable({
  propertyId,
  adminId,
  getAllDocumentApprovalRequestsForGivenProperty,
  setPropertyParentDocumentApprovalRequestStatus,
}: AdminPropertyParentDocumentTableProps) {
  const searchParams = useSearchParams();
  const pageNumberParam = searchParams.get("pageNumber");
  const pageNumber = parseInt(pageNumberParam || "1");
  const pageSizeParam = searchParams.get("pageSize");
  const pageSize = parseInt(pageSizeParam || "1");
  const [result, setResult] = useState<PropertyParentDocument[]>([]);
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
      try {
        const { data: result, error } =
          await getAllDocumentApprovalRequestsForGivenProperty(
            propertyId,
            size,
            pageNumber,
          );
        if (error) {
          toast.error(getErrorMessage(result));
          return;
        }
        if (!result) {
          toast.error("No data found!");
          return;
        }

        setResult(result.items);
        setTotalCount(result.total);
        setHasNextPage(result.has_next_page);
        setHasPreviousPage(result.has_previous_page);
        setTotalPages(result.total_pages);
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    },
    [propertyId, getAllDocumentApprovalRequestsForGivenProperty],
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
            adminId={adminId}
            request={request}
            setPropertyParentDocumentApprovalRequestStatus={
              setPropertyParentDocumentApprovalRequestStatus
            }
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

  return (
    <div className="min-h-[calc(90vh-80px)] flex items-center justify-center">
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
    </div>
  );
}
