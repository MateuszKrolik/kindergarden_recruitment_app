"use client";

import {
  PropertyChild,
  PropertyChildDocumentRequirement,
} from "@/data-access-layer/shared/types/property-management";
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
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Fragment, useCallback, useEffect, useState } from "react";
import { Collapsible, CollapsibleContent } from "../ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider } from "../ui/tooltip";
import { TooltipTrigger } from "@radix-ui/react-tooltip";
import socket from "@/app/socket";
import { PROPERTY_MANAGEMENT_EVENTS } from "@/data-access-layer/shared/events/property-management";
import { ChildrenDocumentRequirementsTable } from "./ChildrenDocumentRequirementsTable";
import { ApiResponse } from "@/data-access-layer/shared/types/response";

const EMPTY_CHILDREN: PropertyChild[] = [];

export type PropertyParentChildrenTableProps = {
  jwt: string;
  propertyId: string;
  userId: string;
  getAllPropertyChildrenForGivenParent(
    jwt: string,
    propertyId: string,
    parentId: string,
  ): ApiResponse<PropertyChild[]>;
  getPropertyChildDocumentRequirements(
    jwt: string,
    propertyId: string,
    childId: string,
  ): ApiResponse<PropertyChildDocumentRequirement[]>;
};

export const PropertyParentChildrenTable = ({
  jwt,
  propertyId,
  userId,
  getAllPropertyChildrenForGivenParent,
  getPropertyChildDocumentRequirements,
}: PropertyParentChildrenTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PropertyChild[]>([]);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

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
  ];

  const fetchPropertyChildrenForGivenParent = useCallback(async () => {
    setError(null);
    const { data, error: fetchErr } =
      await getAllPropertyChildrenForGivenParent(jwt, propertyId, userId);

    if (fetchErr) {
      const errMsg = fetchErr.message;
      toast.error(errMsg);
      setError(errMsg);
      return;
    }

    setData(data);
    setError(null);
  }, [jwt, propertyId, userId, getAllPropertyChildrenForGivenParent]);

  useEffect(() => {
    fetchPropertyChildrenForGivenParent();
  }, [fetchPropertyChildrenForGivenParent]);

  useEffect(() => {
    const onPropertyChildrenUpdated = (updatedChildren: PropertyChild[]) => {
      setData((prev) => {
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
  });

  const table = useReactTable<PropertyChild>({
    data: error ? EMPTY_CHILDREN : data,
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
                <TableHead />
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const isOpen = expandedRow === row.id;

                return (
                  <Fragment key={row.id}>
                    <TableRow data-state={row.getIsSelected() && "selected"}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}

                      {/* Expand/collapse trigger */}
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                onClick={() =>
                                  setExpandedRow(isOpen ? null : row.id)
                                }
                              >
                                {isOpen ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                                <span className="sr-only">
                                  {isOpen
                                    ? "Close Document Requirements"
                                    : "Open Document Requirements"}
                                </span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {isOpen
                                ? "Hide document requirements"
                                : "Show document requirements"}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>

                    {/* Collapsible row content */}
                    <TableRow>
                      <TableCell colSpan={columns.length + 1} className="p-0">
                        <Collapsible
                          open={isOpen}
                          onOpenChange={(open) =>
                            setExpandedRow(open ? row.id : null)
                          }
                        >
                          <CollapsibleContent className="p-4 bg-gray-100">
                            {isOpen && (
                              <ChildrenDocumentRequirementsTable
                                jwt={jwt}
                                propertyId={propertyId}
                                childId={row.original.child_id}
                                getPropertyChildDocumentRequirements={
                                  getPropertyChildDocumentRequirements
                                }
                                key={row.original.child_id}
                              />
                            )}
                          </CollapsibleContent>
                        </Collapsible>
                      </TableCell>
                    </TableRow>
                  </Fragment>
                );
              })
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
