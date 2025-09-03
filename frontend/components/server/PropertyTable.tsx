"use server";

import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { PropertyResponse } from "@/types/property";
import { Card, CardDescription, CardHeader } from "../ui/card";
import { PropertyTableBody } from "../client/PropertyTableBody";
import { PagedResponse } from "@/types/pagination";

export type PropertyTableProps = {
  data: PagedResponse<PropertyResponse> | null;
  error: string | null;
};

export default async function PropertyTable({
  data,
  error,
}: PropertyTableProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardDescription className="text-center">
            A list of properties with open recruitment processes.
          </CardDescription>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px] px-4">ID</TableHead>
              <TableHead className="text-right px-4">Name</TableHead>
            </TableRow>
          </TableHeader>
          <PropertyTableBody data={data} error={error} />
        </Table>
      </Card>
    </div>
  );
}
