"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { ArrowUpDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCallback, useEffect, useState } from "react";
import { ApiResponse } from "@/types/response";
import { PropertyChildDocumentRequirement } from "@/types/modules/property/model";
import { ChildrenDocumentRequirementsTableActionMenu } from "./ChildrenDocumentRequirementsTableActionMenu";
import { CHILD_DOCUMENT_TYPE } from "@/types/modules/reporting/enum";
import { ChildDocument } from "@/types/modules/reporting/model";
import { PropertyChildDocument } from "@/types/modules/compliance/model";
import { PropertyChildDocumentRequest } from "@/types/modules/compliance/dto";

const EMPTY_REQUIREMENTS: PropertyChildDocumentRequirement[] = [];

export type ChildrenDocumentRequirementsTableProps = {
  jwt: string;
  propertyId: string;
  childId: string;
  getPropertyChildDocumentRequirements(
    jwt: string,
    propertyId: string,
    userId: string,
  ): Promise<ApiResponse<PropertyChildDocumentRequirement[]>>;
  getChildDocumentByType(
    jwt: string,
    childId: string,
    documentType: CHILD_DOCUMENT_TYPE,
  ): Promise<ApiResponse<ChildDocument>>;
  getPropertyChildDocumentApprovalRequestByDocumentId(
    jwt: string,
    propertyId: string,
    childId: string,
    childDocId: string,
  ): Promise<ApiResponse<PropertyChildDocument>>;
  sendPropertyChildDocumentApprovalRequest(
    jwt: string,
    propertyId: string,
    childId: string,
    childDocumentId: string,
    body: PropertyChildDocumentRequest,
  ): Promise<ApiResponse<PropertyChildDocument>>;
  saveChildDocument(
    jwt: string,
    childId: string,
    documentType: CHILD_DOCUMENT_TYPE,
    file: File,
  ): Promise<ApiResponse<ChildDocument>>;
  getDocumentURLByFilePath(
    jwt: string,
    key: string,
  ): Promise<ApiResponse<string>>;
};

export const ChildrenDocumentRequirementsTable = ({
  jwt,
  propertyId,
  childId,
  getPropertyChildDocumentRequirements,
  getChildDocumentByType,
  getPropertyChildDocumentApprovalRequestByDocumentId,
  sendPropertyChildDocumentApprovalRequest,
  saveChildDocument,
  getDocumentURLByFilePath,
}: ChildrenDocumentRequirementsTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PropertyChildDocumentRequirement[]>([]);

  const columns: ColumnDef<PropertyChildDocumentRequirement>[] = [
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
      accessorKey: "requirement_type",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Requirement Type
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("requirement_type")}</div>
      ),
    },
    {
      accessorKey: "condition_key",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Condition Key
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("condition_key")}</div>
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
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const requirement = row.original;
        return (
          <ChildrenDocumentRequirementsTableActionMenu
            jwt={jwt}
            propertyId={propertyId}
            childId={childId}
            getChildDocumentByType={getChildDocumentByType}
            requirement={requirement}
            getPropertyChildDocumentApprovalRequestByDocumentId={
              getPropertyChildDocumentApprovalRequestByDocumentId
            }
            sendPropertyChildDocumentApprovalRequest={
              sendPropertyChildDocumentApprovalRequest
            }
            saveChildDocument={saveChildDocument}
            getDocumentURLByFilePath={getDocumentURLByFilePath}
          />
        );
      },
    },
  ];

  const fetchData = useCallback(async () => {
    setError(null);
    const { data, error: fetchErr } =
      await getPropertyChildDocumentRequirements(jwt, propertyId, childId);

    if (fetchErr) {
      const errMsg = fetchErr.message;
      toast.error(errMsg);
      setError(errMsg);
      console.error(fetchErr);
      return;
    }

    setData(data);
    setError(null);
  }, [jwt, propertyId, childId, getPropertyChildDocumentRequirements]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const table = useReactTable<PropertyChildDocumentRequirement>({
    data: error ? EMPTY_REQUIREMENTS : data,
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
