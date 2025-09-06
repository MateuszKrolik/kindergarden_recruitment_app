"use client";

import { PropertyParentDocumentRequirement } from "@/data-access-layer/modules/property-management/model";
import { PagedResponse } from "@/types/pagination";
import { getErrorMessage } from "@/util/error";
import { toast } from "sonner";

export const ParentDocumentRequirementsTable = ({
  data,
}: {
  data: PagedResponse<PropertyParentDocumentRequirement> | Error;
}) => {
  "use client";
  if (data instanceof Error) {
    toast.error(`Error: ${getErrorMessage(data)}`);
    return;
  }
  if (!data || !data.items) {
    toast.error(`Error: No data available!`);
    return;
  }

  return (
    <div className="document-requirements">
      <h2>Document Requirements</h2>

      <div className="table-container">
        <table className="requirements-table">
          <thead>
            <tr>
              <th>Property ID</th>
              <th>Document Type</th>
              <th>Requirement Type</th>
              <th>Condition Key</th>
              <th>Point Value</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index) => (
              <tr key={index}>
                <td>{item.property_id}</td>
                <td>{item.document_type}</td>
                <td>{item.requirement_type}</td>
                <td>{item.condition_key}</td>
                <td>{item.point_value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button
          disabled={!data.has_previous_page}
          onClick={() => {
            console.log("dummy");
          }}
        >
          Previous
        </button>

        <span className="page-info">
          Page {data.page_number} of {data.total_pages}
        </span>

        <button
          disabled={!data.has_next_page}
          onClick={() => {
            console.log("dummy");
          }}
        >
          Next
        </button>
      </div>

      <div className="summary">
        Showing {data.items.length} of {data.total} items
      </div>
    </div>
  );
};
