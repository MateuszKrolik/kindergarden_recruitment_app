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
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useCallback, useEffect, useState } from "react";
import socket from "@/app/socket";
import { PROPERTY_MANAGEMENT_EVENTS } from "shared/events/modules/property-management";
import { ApiResponse } from "shared/types/response";
import { PagedResponse } from "@/types/pagination";
import { formPageResizeUrl, formTargetPageUrl } from "@/util/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { PropertyChild } from "shared/types/modules/property-management";

const EMPTY_CHILDREN: PropertyChild[] = [];

export type AdminPropertyChildrenTableProps = {
  jwt: string;
  propertyId: string;
  getAllPropertyChildrenPaged(
    jwt: string,
    propertyId: string,
    pageSize: number,
    pageNumber: number,
  ): ApiResponse<PagedResponse<PropertyChild>>;
};

export const AdminPropertyChildrenTable = ({
  jwt,
  propertyId,
  getAllPropertyChildrenPaged,
}: AdminPropertyChildrenTableProps) => {
  const searchParams = useSearchParams();
  const pageNumberParam = searchParams.get("pageNumber");
  const pageNumber = parseInt(pageNumberParam || "1");
  const pageSizeParam = searchParams.get("pageSize");
  const pageSize = parseInt(pageSizeParam || "1");
  const [result, setResult] = useState<PropertyChild[]>([]);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [hasPreviousPage, setHasPreviousPage] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const columns: ColumnDef<PropertyChild>[] = [
    {
      accessorKey: "child_id",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Child ID
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("child_id")}</div>
      ),
    },
    {
      accessorKey: "points",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Current Points
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("points")}</div>
      ),
    },
    {
      accessorKey: "approved",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Is Approved?
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => {
        const value = row.getValue("approved") as boolean;
        return <div className="lowercase">{value ? "Yes" : "No"}</div>;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const propertyChild = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link
                  href={`/dashboard/properties/${propertyId}/admin/children/${propertyChild.child_id}`}
                >
                  View Child Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>TODO</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const fetchAllPagedPropertyChildren = useCallback(
    async (propertyId: string, size: number, pNum: number) => {
      setError(null);
      setIsLoading(true);
      const { data: result, error: fetchErr } =
        await getAllPropertyChildrenPaged(jwt, propertyId, size, pNum);

      if (fetchErr) {
        const errMsg = fetchErr.message;
        toast.error(errMsg);
        setError(errMsg);
        setIsLoading(false);
        return;
      }

      setResult(result.items);
      setTotalCount(result.total);
      setHasNextPage(result.has_next_page);
      setHasPreviousPage(result.has_previous_page);
      setTotalPages(result.total_pages);
      setError(null);
      setIsLoading(false);
    },
    [jwt, getAllPropertyChildrenPaged],
  );

  useEffect(() => {
    fetchAllPagedPropertyChildren(propertyId, pageSize, pageNumber);
  }, [fetchAllPagedPropertyChildren, propertyId, pageSize, pageNumber]);

  useEffect(() => {
    const onPropertyChildrenUpdated = (updatedChildren: PropertyChild[]) => {
      setResult((prev) => {
        const prevMap = new Map(prev.map((child) => [child.child_id, child]));
        updatedChildren.forEach((child) => {
          prevMap.set(child.child_id, child);
        });

        return Array.from(prevMap.values());
      });
    };
    socket.on(
      PROPERTY_MANAGEMENT_EVENTS.PROPERTY_CHILDREN_UPDATED,
      onPropertyChildrenUpdated,
    );
    return () => {
      socket.off(
        PROPERTY_MANAGEMENT_EVENTS.PROPERTY_CHILDREN_UPDATED,
        onPropertyChildrenUpdated,
      );
    };
  }, []);

  const table = useReactTable<PropertyChild>({
    data: error ? EMPTY_CHILDREN : result,
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
};
