import { DocumentType } from "../../shared/types/reporting.ts";

export type ParentDocument = {
  id: string;
  user_id: string;
  document_type: DocumentType;
  file_path: string;
};
