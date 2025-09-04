"use server";

import {
  getAllPropertiesTableAction,
  getPropertyUserMeMenuAction,
} from "@/app/actions/properties";
import PropertyTable from "@/components/client/PropertyTable";

export default async function PropertiesPage() {
  return (
    <PropertyTable
      getPropertyUserMeMenuAction={getPropertyUserMeMenuAction}
      fetchProperties={getAllPropertiesTableAction}
    />
  );
}
