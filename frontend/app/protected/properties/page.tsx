"use server";

import { getAllPropertiesTableAction } from "@/app/actions/properties";
import PropertyTable from "@/components/client/PropertyTable";

export default async function PropertiesPage() {
  return <PropertyTable fetchProperties={getAllPropertiesTableAction} />;
}
