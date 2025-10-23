"use client";
import { Property } from "shared/types/modules/property-management";
import { PropertyUser } from "shared/types/modules/identity";
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
import { PropertyTableRowActionMenu } from "./PropertyTableRowActionMenu";
import { ApiResponse } from "shared/types/response";
import { ApiResponsePagedResponseProperty } from "@/api-client";

interface PropertiesTableProps {
  jwt: string;
  userId: string;
  getAllProperties(
    jwt: string,
    pageSize: number,
    pageNumber: number,
  ): Promise<ApiResponsePagedResponseProperty>;
  getPropertyUser(
    jwt: string,
    propertyId: string,
    userId: string,
  ): ApiResponse<PropertyUser>;
}

export default function PropertyTable({
  jwt,
  userId,
  getAllProperties,
  getPropertyUser,
}: PropertiesTableProps) {
  const searchParams = useSearchParams();
  const pageNumberParam = searchParams.get("pageNumber");
  const pageNumber = parseInt(pageNumberParam || "1");
  const pageSizeParam = searchParams.get("pageSize");
  const pageSize = parseInt(pageSizeParam || "1");
  const [result, setResult] = useState<Property[]>([]);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [hasPreviousPage, setHasPreviousPage] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const loadProperties = useCallback(
    async (size: number, pageNumber: number) => {
      setIsLoading(true);
      const { data: result, error } = await getAllProperties(
        jwt,
        size,
        pageNumber,
      );
      if (error) {
        toast.error(error.message);
        setIsLoading(false);
        return;
      }
      if (!result) {
        setIsLoading(false);
        return;
      }
      setResult(result.items);
      setTotalCount(result.total);
      setHasNextPage(result.hasNextPage);
      setHasPreviousPage(result.hasPreviousPage);
      setTotalPages(result.totalPages);
      setIsLoading(false);
    },
    [jwt, getAllProperties],
  );

  useEffect(() => {
    loadProperties(pageSize, pageNumber);
  }, [loadProperties, pageNumber, pageSize]);

  const columns: ColumnDef<Property>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("name")}</div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const property = row.original;
        return (
          <PropertyTableRowActionMenu
            jwt={jwt}
            getPropertyUser={getPropertyUser}
            propertyId={property.id}
            userId={userId}
          />
        );
      },
    },
  ];

  const table = useReactTable<Property>({
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
