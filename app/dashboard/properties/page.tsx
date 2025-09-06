"use server";

import { getAllProperties } from "@/app/actions/property-management";
import PropertyTable from "@/components/client/PropertiesTable";

export default async function PropertySelectionPage() {
  return <PropertyTable getAllProperties={getAllProperties} />;
}
